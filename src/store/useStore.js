import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { broadcastStateUpdate } from '../services/liveSyncService';

// ----------------------------------------------------
// DEFAULT INDIAN FOOD DATABASE
// ----------------------------------------------------
export const INDIAN_FOOD_DATABASE = [
  { id: 'f1', name: 'Paneer Butter Masala', calories: 358, protein: 14, carbs: 12, fats: 28, portionSize: '1 plate (150g)', category: 'Vegetarian' },
  { id: 'f2', name: 'Roti / Chapati (Whole Wheat)', calories: 85, protein: 3, carbs: 18, fats: 0.5, portionSize: '1 piece (30g)', category: 'Vegetarian' },
  { id: 'f3', name: 'Dal Tadka (Yellow Lentil)', calories: 152, protein: 8, carbs: 22, fats: 4, portionSize: '1 bowl (150g)', category: 'Vegetarian' },
  { id: 'f4', name: 'Chicken Tikka', calories: 275, protein: 32, carbs: 3, fats: 15, portionSize: '1 plate (150g)', category: 'Non-Vegetarian' },
  { id: 'f5', name: 'Idli with Sambar', calories: 180, protein: 6, carbs: 36, fats: 1, portionSize: '2 Idlis + Sambar', category: 'Vegetarian' },
  { id: 'f6', name: 'Tandoori Chicken', calories: 230, protein: 30, carbs: 2, fats: 11, portionSize: '1 piece (150g)', category: 'Non-Vegetarian' },
  { id: 'f7', name: 'Aloo Gobhi Sabji', calories: 110, protein: 3, carbs: 15, fats: 5, portionSize: '1 bowl (150g)', category: 'Vegetarian' },
  { id: 'f8', name: 'Mixed Vegetable Sabji', calories: 95, protein: 2.5, carbs: 12, fats: 4.5, portionSize: '1 bowl (150g)', category: 'Vegetarian' },
  { id: 'f9', name: 'Whey Protein Shake', calories: 125, protein: 25, carbs: 2, fats: 1.5, portionSize: '1 scoop (33g)', category: 'Suplement' },
  { id: 'f10', name: 'Egg Bhurji (2 Eggs)', calories: 210, protein: 14, carbs: 4, fats: 16, portionSize: '1 plate', category: 'Non-Vegetarian' },
  { id: 'f11', name: 'White Rice (Cooked)', calories: 130, protein: 2.5, carbs: 28, fats: 0.2, portionSize: '1 bowl (100g)', category: 'Vegetarian' },
  { id: 'f12', name: 'Brown Rice (Cooked)', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, portionSize: '1 bowl (100g)', category: 'Vegetarian' },
  { id: 'f13', name: 'Masala Oats', calories: 160, protein: 5, carbs: 28, fats: 3, portionSize: '1 bowl (40g dry)', category: 'Vegetarian' },
  { id: 'f14', name: 'Samosa', calories: 260, protein: 4, carbs: 32, fats: 13, portionSize: '1 piece (75g)', category: 'Vegetarian' },
  { id: 'f15', name: 'Almonds', calories: 164, protein: 6, carbs: 6, fats: 14, portionSize: '1 handful (28g)', category: 'Vegetarian' },
  { id: 'f16', name: 'Soya Chunks Curry', calories: 190, protein: 21, carbs: 14, fats: 6, portionSize: '1 bowl (150g)', category: 'Vegetarian' },
];

// ----------------------------------------------------
// DEFAULT TRAINER DATABASE
// ----------------------------------------------------
export const CERTIFIED_TRAINERS = [
  {
    id: 't1',
    name: 'Coach Kabir Malhotra',
    specialty: 'Strength & Conditioning, Powerlifting',
    experience: '8 Years',
    rating: '4.9',
    imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200',
    bio: 'Kabir specializes in maximum strength development, functional weight training, and athletic preparation. He has coached over 500+ athletes.',
    slots: ['08:00 AM', '10:00 AM', '04:00 PM', '06:00 PM'],
  },
  {
    id: 't2',
    name: 'Dr. Anjali Sharma',
    specialty: 'Women Wellness, Cycle Syncing & Nutrition',
    experience: '6 Years',
    rating: '4.8',
    imageUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=200',
    bio: 'Anjali holds a PhD in Nutritional Sciences and specializes in cycle-adaptive fitness programs for women, PCOS management, and hormonal health.',
    slots: ['09:00 AM', '11:00 AM', '02:00 PM', '05:00 PM'],
  },
  {
    id: 't3',
    name: 'Coach Rohan Mehta',
    specialty: 'High Intensity Athletic Conditioning & Calisthenics',
    experience: '5 Years',
    rating: '4.7',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    bio: 'Rohan combines gymnastics, high-intensity intervals, and bodyweight masterclass to shape agile, lean, and powerful bodies.',
    slots: ['07:00 AM', '09:00 AM', '03:00 PM', '07:00 PM'],
  }
];

// ----------------------------------------------------
// DEFAULT SYSTEM ACHIEVEMENTS
// ----------------------------------------------------
export const DEFAULT_ACHIEVEMENTS = [
  { id: 'a1', title: 'First Steps', description: 'Complete your fitness profile onboarding.', icon: 'trophy', unlocked: false, date: null },
  { id: 'a2', title: 'Hydration Hero', description: 'Log a total of 10+ glasses of water.', icon: 'water', unlocked: false, date: null },
  { id: 'a3', title: 'Iron Discipline', description: 'Log your first completed gym workout.', icon: 'barbell', unlocked: false, date: null },
  { id: 'a4', title: 'Cycle Sync Master', description: 'Log your menstrual cycle details to align workouts.', icon: 'flower', unlocked: false, date: null },
  { id: 'a5', title: 'Caloric Champion', description: 'Log an Indian food item in your nutrition logger.', icon: 'restaurant', unlocked: false, date: null },
];

// ----------------------------------------------------
// ----------------------------------------------------
// CALCULATORS
// ----------------------------------------------------
export const calculateAgeFromDOB = (dobString) => {
  if (!dobString) return 25;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(1, age);
};

export const calculateTargets = (profile) => {
  if (!profile) return { calories: 2000, protein: 120, carbs: 200, fats: 60 };

  const weight = parseFloat(profile.weight) || 70;
  const height = parseFloat(profile.height) || 170;
  const age = profile.dob ? calculateAgeFromDOB(profile.dob) : (parseInt(profile.age) || 25);
  const gender = profile.gender || 'Male';
  const activity = profile.activityLevel || 'Moderately Active';
  const goal = profile.goal || 'Maintenance';

  // BMR (Mifflin-St Jeor Equation)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'Male') {
    bmr += 5;
  } else if (gender === 'Female') {
    bmr -= 161;
  } else {
    bmr -= 78; // average
  }

  // TDEE Activity multiplier
  let multiplier = 1.2; // Sedentary
  if (activity === 'Lightly Active') multiplier = 1.375;
  else if (activity === 'Moderately Active') multiplier = 1.55;
  else if (activity === 'Very Active') multiplier = 1.725;

  const tdee = bmr * multiplier;

  // Calorie targets based on goal
  let targetCalories = tdee;
  if (goal === 'Weight Loss') targetCalories = tdee - 450;
  else if (goal === 'Muscle Gain') targetCalories = tdee + 350;
  else if (goal === 'Athletic Performance') targetCalories = tdee + 150;

  // Ensure calorie target doesn't fall below survival baseline
  targetCalories = Math.max(1200, Math.round(targetCalories));

  // Macronutrient breakdowns
  // Protein (g): Based on weight and fitness goals
  let proteinPerKg = 1.6; // default
  if (goal === 'Muscle Gain') proteinPerKg = 2.2;
  else if (goal === 'Weight Loss') proteinPerKg = 1.8;

  const targetProtein = Math.round(weight * proteinPerKg);
  
  // Fats: ~25% of total calories, divided by 9 kcal/g
  const targetFats = Math.round((targetCalories * 0.25) / 9);

  // Carbs: Remaining calories divided by 4 kcal/g
  const proteinCals = targetProtein * 4;
  const fatsCals = targetFats * 9;
  const targetCarbs = Math.max(50, Math.round((targetCalories - (proteinCals + fatsCals)) / 4));

  return {
    calories: targetCalories,
    protein: targetProtein,
    carbs: targetCarbs,
    fats: targetFats,
  };
};

export const calculateReadinessScore = (sleepHours = 7.5, mood = 'Calm', cyclePhase = 'Follicular Phase') => {
  let score = 70; // baseline

  // Sleep effect
  if (sleepHours >= 8) score += 15;
  else if (sleepHours >= 7) score += 10;
  else if (sleepHours >= 6) score += 0;
  else score -= 15; // sleep deprivation

  // Mood effect
  if (mood === 'Energetic') score += 15;
  else if (mood === 'Happy') score += 10;
  else if (mood === 'Calm') score += 5;
  else if (mood === 'Tired') score -= 10;
  else if (mood === 'Anxious') score -= 12;
  else if (mood === 'Sad') score -= 15;

  // Cycle phase effect (For women wellness)
  if (cyclePhase.includes('Ovulation')) score += 15; // peak hormonal strength
  else if (cyclePhase.includes('Follicular')) score += 8; // energy rising
  else if (cyclePhase.includes('Menstruation')) score -= 15; // cramps, low hormone level
  else if (cyclePhase.includes('Luteal')) score -= 5; // winding down

  return Math.min(100, Math.max(10, score));
};

export const getMoodAdaptation = (mood) => {
  switch (mood) {
    case 'Energetic':
      return {
        intensity: 'HIGH (+10% Load)',
        volume: '4 Sets per Exercise',
        advice: 'You have peak energy today! Push for personal records on your primary compound lifts.',
        quote: '"Intensity builds density. Make today count!"',
        recovery: 'Post-workout protein within 45 mins & cold shower.'
      };
    case 'Happy':
      return {
        intensity: 'MODERATE-HIGH',
        volume: '3-4 Sets per Exercise',
        advice: 'Great mood! Maintain strong mind-muscle connection and clean tempo control.',
        quote: '"Positivity fuels performance. Enjoy the burn!"',
        recovery: 'Standard hydration (3.0L) & 8 hours sleep.'
      };
    case 'Tired':
      return {
        intensity: 'LIGHT (-15% Load)',
        volume: '2-3 Sets per Exercise',
        advice: 'Body energy is low today. Focus on light weight, high reps, or active stretching.',
        quote: '"Consistency over intensity. Showing up is winning."',
        recovery: 'Increase hydration by +500ml and aim for 8+ hours sleep.'
      };
    case 'Stressed':
      return {
        intensity: 'MODERATE MOBILITY',
        volume: '3 Sets Controlled',
        advice: 'De-stress with controlled breathing tempo and joint mobility drills.',
        quote: '"Exercise clears the mind. Move to relieve pressure."',
        recovery: '10-minute post-workout mindfulness & mag-rich dinner.'
      };
    case 'Sore':
      return {
        intensity: 'RECOVERY SPLIT',
        volume: '2 Sets Active Recovery',
        advice: 'Muscle soreness detected. Focus on light mobility, hamstrings stretch, and walk.',
        quote: '"Rest is where muscle grows. Protect your recovery."',
        recovery: 'Foam rolling 15 mins, warm bath & 3.5L water.'
      };
    case 'Low Motivation':
      return {
        intensity: 'QUICK 15-MIN EXPRESS',
        volume: '2 Fast Sets',
        advice: 'Keep it super short today: 3 compound exercises max to maintain momentum.',
        quote: '"Action creates motivation, not the other way around."',
        recovery: 'Celebrate completion & log your daily workout!'
      };
    default:
      return {
        intensity: 'BALANCED',
        volume: '3 Sets per Exercise',
        advice: 'Standard progressive training session tuned for maximum hypertrophy.',
        quote: '"Daily discipline yields long-term transformation."',
        recovery: 'Hydrate well & log daily macronutrients.'
      };
  }
};

export const useStore = create(
  persist(
    (set, get) => ({
      // User Profile & Authentication State
      user: null,
      hasCompletedOnboarding: false,
      lastResetDate: null,
      lastActiveDate: new Date().toISOString().split('T')[0],
      
      // Daily Stats (Reset manually or dynamically simulated)
      caloriesConsumed: 0,
      loggedFoods: [],
      waterIntake: 0, // In ml (e.g. 250ml per glass)
      waterIntakeGoal: 3000, // 3 Liters
      sleepHours: 7.5,
      readinessScore: 80,
      activeStreak: 5,
      lastActiveDate: new Date().toISOString().split('T')[0],

      // Wellness & Women Cycle Tracking
      lastPeriodDate: null, // String date "YYYY-MM-DD"
      periodEndDate: null,
      cycleLength: 28,
      currentMood: 'Calm',
      loggedSymptoms: [],
      wellnessLogs: [], // historical logs

      // Trainer Consultation
      bookedAppointments: [],
      consultationNotes: [
        {
          id: 'n1',
          trainerName: 'Dr. Anjali Sharma',
          date: '2026-05-20',
          notes: 'Discussed optimizing macros for cycle-syncing. Decreased simple carbs during the luteal phase, focused on zinc/magnesium rich snacks.',
        },
        {
          id: 'n2',
          trainerName: 'Coach Kabir Malhotra',
          date: '2026-05-15',
          notes: 'Completed squat depth assessment. Recommended hamstring mobility stretching post-workout to support solid barbell squats.',
        }
      ],

      // Completed Workouts & Detailed Logs
      completedWorkouts: [],
      workoutLogs: [], // Array of { id, date, exerciseName, muscle, weight, reps }

      // Gamification
      achievements: DEFAULT_ACHIEVEMENTS,
      notifications: [
        { id: 'n_init', title: 'Welcome to BurnX!', body: 'Your universal personalized fitness hub is fully ready offline.', date: new Date().toLocaleTimeString(), read: false }
      ],

      // Theme
      themeMode: 'dark',

      // Payment & Premium
      isPremium: false,
      subscriptionPlan: null,
      subscriptionExpiryDate: null,
      
      // AI Coach Limits
      aiChatCount: 0,
      aiChatMonth: new Date().getMonth(),

      // ----------------------------------------------------
      // ACTIONS / WRITERS
      // ----------------------------------------------------
      
      // Onboarding & Profile Action
      completeOnboarding: (profileData) => {
        const computedAge = profileData.dob ? calculateAgeFromDOB(profileData.dob) : (parseInt(profileData.age) || 25);
        const fullProfile = { ...profileData, age: computedAge };
        const targets = calculateTargets(fullProfile);
        
        // Setup initial female cycle dates if female gender
        let lastPeriod = profileData.lastPeriodDate || null;
        if (profileData.gender === 'Female' && !lastPeriod) {
          const tenDaysAgo = new Date();
          tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
          lastPeriod = tenDaysAgo.toISOString().split('T')[0];
        }

        const calculatedReadiness = calculateReadinessScore(7.5, 'Calm', profileData.gender === 'Female' ? 'Follicular Phase (Day 10)' : 'N/A');

        const updatedUser = {
          id: profileData.id || 'burnx-user-id',
          name: profileData.name || 'Athlete',
          email: profileData.email || 'athlete@burnx.com',
          dob: profileData.dob || '2001-01-01',
          age: computedAge,
          weight: parseFloat(profileData.weight) || 70,
          height: parseFloat(profileData.height) || 170,
          gender: profileData.gender || 'Male',
          goal: profileData.goal || 'Maintenance',
          activityLevel: profileData.activityLevel || 'Moderately Active',
          experience: profileData.experience || 'Intermediate',
          equipment: profileData.equipment || 'Full Gym',
          workoutPreference: profileData.workoutPreference || 'Strength Training',
          dietaryPreference: profileData.dietaryPreference || 'None',
          injuries: profileData.injuries || '',
          lastPeriodDate: lastPeriod,
          cycleLength: parseInt(profileData.cycleLength) || 28,
          role: profileData.role || 'client'
        };

        set({
          user: updatedUser,
          hasCompletedOnboarding: true,
          calorieTarget: targets.calories,
          macroTarget: { protein: targets.protein, carbs: targets.carbs, fats: targets.fats },
          lastPeriodDate: lastPeriod,
          cycleLength: parseInt(profileData.cycleLength) || 28,
          readinessScore: calculatedReadiness,
        });

        // Trigger Achievement Unlocking
        get().unlockAchievement('a1');
      },

      updateProfile: (profileData) => {
        const currentUser = get().user || {};
        // Immutable fields (Name, Gender, DOB) cannot be changed once set
        const immutableName = currentUser.name || profileData.name;
        const immutableGender = currentUser.gender || profileData.gender;
        const immutableDob = currentUser.dob || profileData.dob;
        const computedAge = immutableDob ? calculateAgeFromDOB(immutableDob) : (parseInt(profileData.age) || currentUser.age || 25);

        const mergedProfile = { 
          ...currentUser, 
          ...profileData, 
          name: immutableName,
          gender: immutableGender,
          dob: immutableDob,
          age: computedAge
        };
        const targets = calculateTargets(mergedProfile);
        
        // Recalculate phase & readiness if female gender
        let calculatedReadiness = get().readinessScore;
        if (mergedProfile.gender === 'Female' && mergedProfile.lastPeriodDate) {
          const lastDate = new Date(mergedProfile.lastPeriodDate);
          const today = new Date();
          const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
          const cycleDay = diffDays % (mergedProfile.cycleLength || 28);
          let phase = 'Follicular Phase';
          if (cycleDay >= 0 && cycleDay <= 5) phase = 'Menstruation';
          else if (cycleDay > 5 && cycleDay <= 13) phase = 'Follicular Phase';
          else if (cycleDay >= 14 && cycleDay <= 15) phase = 'Ovulation';
          else phase = 'Luteal Phase';

          calculatedReadiness = calculateReadinessScore(get().sleepHours, get().currentMood, phase);
        } else {
          calculatedReadiness = calculateReadinessScore(get().sleepHours, get().currentMood, 'N/A');
        }

        set({
          user: mergedProfile,
          calorieTarget: targets.calories,
          macroTarget: { protein: targets.protein, carbs: targets.carbs, fats: targets.fats },
          lastPeriodDate: mergedProfile.lastPeriodDate || null,
          cycleLength: parseInt(mergedProfile.cycleLength) || 28,
          readinessScore: calculatedReadiness,
        });
      },

      // Bypass Auth directly (Quick Dev mode)
      bypassAuth: (role = 'client') => {
        const dummyProfile = {
          name: role === 'admin' ? 'System Administrator' : role === 'trainer' ? 'Coach Kabir Malhotra' : 'BurnX Client',
          email: `${role}@burnx.com`,
          age: 28,
          weight: 72,
          height: 175,
          gender: 'Female',
          goal: 'Muscle Gain',
          activityLevel: 'Moderately Active',
          experience: 'Intermediate',
          equipment: 'Full Gym',
          workoutPreference: 'Strength Training',
          dietaryPreference: 'Vegetarian',
          injuries: '',
          cycleLength: 28,
          role: role,
        };
        get().completeOnboarding(dummyProfile);
        set((state) => ({ user: { ...state.user, role: role } }));
      },

      setVerifiedProfile: (completeProfile) => {
        const targets = calculateTargets(completeProfile);
        set({
          user: completeProfile,
          hasCompletedOnboarding: true,
          calorieTarget: targets.calories,
          macroTarget: { protein: targets.protein, carbs: targets.carbs, fats: targets.fats }
        });
      },

      setPendingAuthUser: (authUser) => {
        set({
          user: authUser,
          hasCompletedOnboarding: false
        });
      },

      logout: () => {
        set({
          user: null,
          hasCompletedOnboarding: false,
          caloriesConsumed: 0,
          loggedFoods: [],
          waterIntake: 0,
          completedWorkouts: [],
          bookedAppointments: [],
          achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, date: null })),
          notifications: [
            { id: 'n_out', title: 'Logged out successfully.', body: 'You have cleared your active session.', date: new Date().toLocaleTimeString(), read: true }
          ]
        });
      },

      deleteAccount: async () => {
        const currentUser = get().user;

        // 1. Immediately reset Zustand state so UI returns to Login screen synchronously
        set({
          user: null,
          hasCompletedOnboarding: false,
          caloriesConsumed: 0,
          loggedFoods: [],
          waterIntake: 0,
          completedWorkouts: [],
          bookedAppointments: [],
          achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, date: null })),
          notifications: []
        });

        // 2. Wipe browser / local storage completely
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.clear();
          }
        } catch (e) {}

        // 3. Delete user profile record from Supabase database
        if (currentUser?.id && supabase) {
          try {
            await supabase.from('profiles').delete().eq('id', currentUser.id);
            await supabase.auth.signOut().catch(() => {});
          } catch (err) {
            console.log('Error deleting database profile:', err);
          }
        }
      },

      // Water Logger Actions (in mL)
      addWater: (amountMl) => {
        const newIntake = get().waterIntake + amountMl;
        set({ waterIntake: newIntake });
        broadcastStateUpdate({ waterIntake: newIntake });

        if (newIntake >= 2500) {
          get().unlockAchievement('a2');
        }
      },

      resetWater: () => {
        set({ waterIntake: 0 });
        broadcastStateUpdate({ waterIntake: 0 });
      },

      // Nutrition Actions
      addFood: (foodItem, weightGrams = 100, mealCategory = 'Breakfast') => {
        const multiplier = weightGrams / 100;
        
        const loggedItem = {
          id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          foodId: foodItem.id || 'custom',
          name: foodItem.name,
          calories: Math.round(foodItem.calories * multiplier),
          protein: Math.round(foodItem.protein * multiplier),
          carbs: Math.round(foodItem.carbs * multiplier),
          fats: Math.round(foodItem.fats * multiplier),
          weight: weightGrams,
          mealCategory: mealCategory,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedFoods = [...get().loggedFoods, loggedItem];
        const newCaloriesConsumed = updatedFoods.reduce((acc, curr) => acc + curr.calories, 0);

        set({
          loggedFoods: updatedFoods,
          caloriesConsumed: newCaloriesConsumed
        });

        // Trigger Caloric Champion achievement
        get().unlockAchievement('a5');
      },

      removeFood: (loggedFoodId) => {
        const updatedFoods = get().loggedFoods.filter(f => f.id !== loggedFoodId);
        const newCaloriesConsumed = updatedFoods.reduce((acc, curr) => acc + curr.calories, 0);

        set({
          loggedFoods: updatedFoods,
          caloriesConsumed: newCaloriesConsumed
        });
      },

      // Wellness & Mood Logger Actions
      logMoodAndCycle: (mood, symptoms, customPeriodDate = null, customEndDate = null) => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        let targetPeriodDate = get().lastPeriodDate;
        let targetEndDate = get().periodEndDate;
        if (customPeriodDate) {
          targetPeriodDate = customPeriodDate;
        }
        if (customEndDate) {
          targetEndDate = customEndDate;
        }

        // Calculate phase
        let phase = 'Follicular Phase';
        if (get().user?.gender === 'Female' && targetPeriodDate) {
          const lastDate = new Date(targetPeriodDate);
          const today = new Date();
          const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
          const cycleDay = diffDays % (get().cycleLength || 28);
          
          if (cycleDay >= 0 && cycleDay <= 5) phase = 'Menstruation';
          else if (cycleDay > 5 && cycleDay <= 13) phase = 'Follicular Phase';
          else if (cycleDay >= 14 && cycleDay <= 15) phase = 'Ovulation';
          else phase = 'Luteal Phase';
        }

        const calculatedReadiness = calculateReadinessScore(get().sleepHours, mood, phase);

        const newLog = {
          date: todayStr,
          mood: mood,
          symptoms: symptoms,
          cyclePhase: phase,
        };

        // Upsert log for today
        const existingLogs = get().wellnessLogs.filter(l => l.date !== todayStr);
        const updatedLogs = [...existingLogs, newLog];

        set({
          currentMood: mood,
          loggedSymptoms: symptoms,
          lastPeriodDate: targetPeriodDate,
          periodEndDate: targetEndDate,
          wellnessLogs: updatedLogs,
          readinessScore: calculatedReadiness
        });

        // If female user logged cycle details, trigger achievement
        if (get().user?.gender === 'Female') {
          get().unlockAchievement('a4');
        }
      },

      setSleepHours: (hours) => {
        // Recalculate readiness
        let phase = 'N/A';
        if (get().user?.gender === 'Female' && get().lastPeriodDate) {
          const lastDate = new Date(get().lastPeriodDate);
          const today = new Date();
          const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
          const cycleDay = diffDays % (get().cycleLength || 28);
          
          if (cycleDay >= 0 && cycleDay <= 5) phase = 'Menstruation';
          else if (cycleDay > 5 && cycleDay <= 13) phase = 'Follicular Phase';
          else if (cycleDay >= 14 && cycleDay <= 15) phase = 'Ovulation';
          else phase = 'Luteal Phase';
        }

        const calculatedReadiness = calculateReadinessScore(hours, get().currentMood, phase);

        set({
          sleepHours: parseFloat(hours) || 7.5,
          readinessScore: calculatedReadiness
        });
      },

      // Workout Completion Logger
      completeWorkout: (workoutName, splitName, durationMins, exercisesCount) => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        const newWorkoutLog = {
          id: 'work_' + Date.now(),
          name: workoutName,
          split: splitName,
          date: todayStr,
          duration: durationMins,
          exercisesCount: exercisesCount,
        };

        const updatedWorkouts = [newWorkoutLog, ...get().completedWorkouts];

        // Increment streak if not completed workout today already
        let newStreak = get().activeStreak;
        const lastActive = get().lastActiveDate;
        
        if (lastActive !== todayStr) {
          // If yesterday was active, increment, else keep or reset
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastActive === yesterdayStr || get().completedWorkouts.length === 0) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        set({
          completedWorkouts: updatedWorkouts,
          activeStreak: newStreak,
          lastActiveDate: todayStr
        });

        // Trigger achievements
        get().unlockAchievement('a3');
        
        get().addNotification(
          'Workout Logged!',
          `Awesome job completing your "${workoutName}" workout split! Keep pushing.`
        );
      },

      logExerciseSet: (exerciseName, muscle, weight, reps) => {
        const now = new Date();
        const todayStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newLog = {
          id: 'logset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          date: todayStr,
          time: timeStr,
          exerciseName,
          muscle,
          weight: parseFloat(weight) || 0,
          reps: parseInt(reps) || 0,
        };

        set((state) => ({
          workoutLogs: [newLog, ...state.workoutLogs]
        }));
      },

      deleteWorkoutLog: (logId) => {
        set((state) => ({
          workoutLogs: state.workoutLogs.filter(log => log.id !== logId)
        }));
      },

      // Trainer Booking Actions
      bookTrainerAppointment: (trainerId, trainerName, dateStr, timeSlot, userNotes) => {
        const newAppt = {
          id: 'appt_' + Date.now(),
          trainerId,
          trainerName,
          date: dateStr,
          time: timeSlot,
          notes: userNotes,
        };

        set((state) => ({
          bookedAppointments: [newAppt, ...state.bookedAppointments]
        }));

        get().addNotification(
          'Appointment Confirmed!',
          `Your appointment with ${trainerName} on ${dateStr} at ${timeSlot} is confirmed offline.`
        );
      },

      cancelTrainerAppointment: (apptId) => {
        set((state) => ({
          bookedAppointments: state.bookedAppointments.filter(a => a.id !== apptId)
        }));
      },

      // Achievements & Streaks Action
      unlockAchievement: (id) => {
        let isNewlyUnlocked = false;
        const updatedAchievements = get().achievements.map((ach) => {
          if (ach.id === id && !ach.unlocked) {
            isNewlyUnlocked = true;
            return { ...ach, unlocked: true, date: new Date().toLocaleDateString() };
          }
          return ach;
        });

        if (isNewlyUnlocked) {
          set({ achievements: updatedAchievements });
          
          const unlockedAch = get().achievements.find(a => a.id === id);
          if (unlockedAch) {
            get().addNotification(
              '🏆 Achievement Unlocked!',
              `Congratulations! You unlocked the "${unlockedAch.title}" badge.`
            );
          }
        }
      },

      // Notification Helpers
      addNotification: (title, body) => {
        const newNotif = {
          id: 'notif_' + Date.now(),
          title,
          body,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications]
        }));
      },

      markNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      checkDailyReset: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastReset = get().lastResetDate;

        if (lastReset && lastReset !== todayStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let newStreak = get().activeStreak;
          if (get().lastActiveDate !== yesterdayStr && get().lastActiveDate !== todayStr) {
            newStreak = 0;
          }

          set({
            waterIntake: 0,
            caloriesConsumed: 0,
            loggedFoods: [],
            lastResetDate: todayStr,
            activeStreak: newStreak
          });
        } else if (!lastReset) {
          set({ lastResetDate: todayStr });
        }
      },

      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },

      unlockPremium: (planId = 'yearly') => {
        const now = Date.now();
        let days = 365;
        if (planId === 'weekly') days = 7;
        if (planId === 'monthly') days = 30;
        if (planId === 'yearly') days = 365;

        const expiryMs = now + (days * 24 * 60 * 60 * 1000);

        set({
          isPremium: true,
          subscriptionPlan: planId,
          subscriptionExpiryDate: expiryMs
        });

        get().addNotification(
          '🎉 Premium Unlocked!',
          `Your ${planId.toUpperCase()} subscription is active for ${days} days! Enjoy unlimited AI Coach & Pro Features.`
        );
      },

      checkSubscriptionStatus: () => {
        const { isPremium, subscriptionExpiryDate, subscriptionPlan } = get();
        if (isPremium && subscriptionExpiryDate && Date.now() > subscriptionExpiryDate) {
          set({
            isPremium: false,
            subscriptionPlan: null,
            subscriptionExpiryDate: null
          });

          get().addNotification(
            'Subscription Expired',
            `Your ${subscriptionPlan || 'premium'} plan has ended. Please renew to continue using BurnX Coach AI.`
          );
        }
      },

      incrementAiChatCount: () => {
        const currentMonth = new Date().getMonth();
        let currentCount = get().aiChatCount;
        if (get().aiChatMonth !== currentMonth) {
          currentCount = 0;
        }
        set({ aiChatCount: currentCount + 1, aiChatMonth: currentMonth });
      }
    }),
    {
      name: 'burnx-offline-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
