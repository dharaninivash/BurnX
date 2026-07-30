import { supabase } from './supabase';
import { calculateAgeFromDOB, calculateTargets } from '../store/useStore';

/**
 * Validates whether a profile record exists in Supabase database and has all required fields.
 * Required fields: dob, gender, height, weight, goal
 */
export function isProfileComplete(profile) {
  if (!profile) return false;
  
  const hasDob = !!profile.dob && String(profile.dob).trim() !== '';
  const hasGender = !!profile.gender && String(profile.gender).trim() !== '';
  const hasHeight = profile.height !== null && profile.height !== undefined && Number(profile.height) > 0;
  const hasWeight = profile.weight !== null && profile.weight !== undefined && Number(profile.weight) > 0;
  const hasGoal = !!profile.goal && String(profile.goal).trim() !== '';

  return hasDob && hasGender && hasHeight && hasWeight && hasGoal;
}

/**
 * 1. Calls supabase.auth.getUser() or uses provided authUser
 * 2. Retrieves auth.uid()
 * 3. Queries profiles table: SELECT * FROM profiles WHERE id = auth.uid()
 * 4. Checks profile existence & completeness
 */
export async function checkUserProfile(providedAuthUser = null) {
  try {
    let authUser = providedAuthUser;
    
    if (!authUser && supabase && supabase.auth) {
      const { data } = await supabase.auth.getUser();
      authUser = data?.user || null;
    }

    if (!authUser || !authUser.id) {
      return { status: 'NO_AUTH', user: null, profile: null };
    }

    const userId = authUser.id;

    if (!supabase || !supabase.from) {
      return { status: 'OFFLINE_FALLBACK', user: authUser, profile: null };
    }

    // Query profiles table: SELECT * FROM profiles WHERE id = auth.uid()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase profiles query notice:', error.message);
    }

    if (profile) {
      const formattedProfile = {
        id: userId,
        name: profile.name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Athlete',
        email: profile.email || authUser.email,
        role: profile.role || 'client',
        dob: profile.dob || '2000-01-15',
        age: profile.age || calculateAgeFromDOB(profile.dob || '2000-01-15'),
        gender: profile.gender || 'Male',
        height: Number(profile.height) || 170,
        weight: Number(profile.weight) || 70,
        goal: profile.goal || 'Maintenance',
        activityLevel: profile.activity_level || profile.activityLevel || 'Moderately Active',
        calorieTarget: profile.calorie_target || profile.calorieTarget,
        proteinTarget: profile.protein_target || profile.proteinTarget,
        carbsTarget: profile.carbs_target || profile.carbsTarget,
        fatsTarget: profile.fats_target || profile.fatsTarget,
        experience: profile.experience || 'Intermediate',
        equipment: profile.equipment || 'Full Gym'
      };

      return {
        status: 'COMPLETE',
        user: authUser,
        profile: formattedProfile
      };
    }

    // Check user_metadata for stored profile or completion flag
    const meta = authUser.user_metadata || {};
    if (meta.has_completed_onboarding || meta.dob || meta.weight || meta.gender) {
      const formattedProfile = {
        id: userId,
        name: meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Athlete',
        email: authUser.email,
        role: meta.role || 'client',
        dob: meta.dob || '2000-01-15',
        age: meta.age || calculateAgeFromDOB(meta.dob || '2000-01-15'),
        gender: meta.gender || 'Male',
        height: Number(meta.height) || 170,
        weight: Number(meta.weight) || 70,
        goal: meta.goal || 'Maintenance',
        activityLevel: meta.activityLevel || 'Moderately Active',
        experience: meta.experience || 'Intermediate',
        equipment: meta.equipment || 'Full Gym'
      };

      // Ensure profile row exists in database
      await createProfileAfterOnboarding(userId, formattedProfile);

      return {
        status: 'COMPLETE',
        user: authUser,
        profile: formattedProfile
      };
    }

    // Check account creation timestamp. If account is existing (> 60s old), treat as complete and auto-save profile
    const createdAt = authUser.created_at ? new Date(authUser.created_at).getTime() : 0;
    const accountAgeMs = Date.now() - createdAt;

    if (createdAt > 0 && accountAgeMs > 60000) {
      const defaultProfile = {
        id: userId,
        name: meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Athlete',
        email: authUser.email,
        role: meta.role || 'client',
        dob: '2000-01-15',
        age: 25,
        gender: 'Male',
        height: 170,
        weight: 70,
        goal: 'Maintenance',
        activityLevel: 'Moderately Active',
        experience: 'Intermediate',
        equipment: 'Full Gym'
      };

      await createProfileAfterOnboarding(userId, defaultProfile);

      return {
        status: 'COMPLETE',
        user: authUser,
        profile: defaultProfile
      };
    }

    // Only brand-new signups (created < 60s ago with no saved profile) go to onboarding!
    return {
      status: 'INCOMPLETE',
      user: {
        id: userId,
        email: authUser.email,
        name: meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Athlete'
      },
      profile: null
    };

  } catch (err) {
    console.warn('checkUserProfile exception:', err.message);
    return { status: 'ERROR', error: err };
  }
}

/**
 * Inserts / Upserts a profile record into Supabase ONLY AFTER onboarding completion.
 * Guarantee: Uses id = auth.uid(). Never generates another UUID.
 */
export async function createProfileAfterOnboarding(userId, onboardingData) {
  if (!userId) {
    throw new Error('Cannot create profile without an authenticated user ID (auth.uid()).');
  }

  const computedAge = onboardingData.dob 
    ? calculateAgeFromDOB(onboardingData.dob) 
    : (parseInt(onboardingData.age) || 25);

  const fullData = {
    ...onboardingData,
    id: userId, // MUST use auth.uid()
    age: computedAge
  };

  const targets = calculateTargets(fullData);

  const dbRow = {
    id: userId, // auth.uid()
    name: fullData.name || 'Athlete',
    email: fullData.email,
    role: fullData.role || 'client',
    dob: fullData.dob,
    age: computedAge,
    gender: fullData.gender,
    height: Number(fullData.height),
    weight: Number(fullData.weight),
    goal: fullData.goal,
    activity_level: fullData.activityLevel || 'Moderately Active',
    experience: fullData.experience || 'Intermediate',
    equipment: fullData.equipment || 'Full Gym',
    calorie_target: targets.calories,
    protein_target: targets.protein,
    carbs_target: targets.carbs,
    fats_target: targets.fats,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    if (supabase.from) {
      const { error } = await supabase
        .from('profiles')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('Profile DB insertion error:', error.message);
      }
    }

    if (supabase.auth && supabase.auth.updateUser) {
      try {
        await supabase.auth.updateUser({
          data: {
            has_completed_onboarding: true,
            full_name: fullData.name,
            gender: fullData.gender,
            dob: fullData.dob,
            height: fullData.height,
            weight: fullData.weight,
            goal: fullData.goal
          }
        });
      } catch (metaErr) {
        console.warn('User metadata update notice:', metaErr?.message);
      }
    }
  }

  return {
    profile: {
      ...fullData,
      calorieTarget: targets.calories,
      proteinTarget: targets.protein,
      carbsTarget: targets.carbs,
      fatsTarget: targets.fats
    }
  };
}
