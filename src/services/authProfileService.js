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

    if (profile && isProfileComplete(profile)) {
      const formattedProfile = {
        id: userId,
        name: profile.name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Athlete',
        email: profile.email || authUser.email,
        role: profile.role || 'client',
        dob: profile.dob,
        age: profile.age || calculateAgeFromDOB(profile.dob),
        gender: profile.gender,
        height: Number(profile.height),
        weight: Number(profile.weight),
        goal: profile.goal,
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

    // Profile does not exist OR is missing required fields -> Must complete onboarding!
    return {
      status: 'INCOMPLETE',
      user: {
        id: userId,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Athlete'
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

  if (supabase && supabase.from) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) {
      console.warn('Profile DB insertion error:', error.message);
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
