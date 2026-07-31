import { supabase } from './supabase';
import { useStore } from '../store/useStore';

let liveChannel = null;
let currentSubscribedUserId = null;

/**
 * Initializes a Supabase Realtime broadcast channel for the logged-in user.
 * Enables instant 2-way live sync for ALL logs and state between phone, laptop, and desktop browsers.
 */
export function initLiveSync(userId) {
  if (!userId || !supabase || typeof supabase.channel !== 'function') return;

  if (currentSubscribedUserId === userId && liveChannel) {
    return;
  }

  // Clean up any existing channel
  if (liveChannel) {
    try {
      supabase.removeChannel(liveChannel);
    } catch (_) {}
    liveChannel = null;
  }

  currentSubscribedUserId = userId;

  try {
    const channelName = `burnx_full_sync_${userId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    liveChannel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false } // Receive events sent by other devices of the same user
      }
    });

    liveChannel
      .on('broadcast', { event: 'FULL_STATE_UPDATE' }, ({ payload }) => {
        if (!payload) return;

        // Instantly sync state across devices
        const updates = {};
        if (typeof payload.waterIntake === 'number') updates.waterIntake = payload.waterIntake;
        if (typeof payload.caloriesConsumed === 'number') updates.caloriesConsumed = payload.caloriesConsumed;
        if (Array.isArray(payload.loggedFoods)) updates.loggedFoods = payload.loggedFoods;
        if (Array.isArray(payload.completedWorkouts)) updates.completedWorkouts = payload.completedWorkouts;
        if (Array.isArray(payload.workoutLogs)) updates.workoutLogs = payload.workoutLogs;
        if (typeof payload.sleepHours === 'number') updates.sleepHours = payload.sleepHours;
        if (typeof payload.readinessScore === 'number') updates.readinessScore = payload.readinessScore;
        if (typeof payload.activeStreak === 'number') updates.activeStreak = payload.activeStreak;
        if (payload.currentMood) updates.currentMood = payload.currentMood;
        if (Array.isArray(payload.loggedSymptoms)) updates.loggedSymptoms = payload.loggedSymptoms;
        if (Array.isArray(payload.wellnessLogs)) updates.wellnessLogs = payload.wellnessLogs;
        if (Array.isArray(payload.achievements)) updates.achievements = payload.achievements;
        if (payload.lastPeriodDate !== undefined) updates.lastPeriodDate = payload.lastPeriodDate;

        if (Object.keys(updates).length > 0) {
          useStore.setState(updates);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ BurnX Universal Live Sync Channel Active for:', userId);
        }
      });

    // Load persisted state from Supabase database on launch
    fetchPersistedBackendState(userId);

  } catch (e) {
    console.warn('Live sync initialization notice:', e?.message);
  }
}

/**
 * Broadcasts ANY state or log update across all devices and persists to Supabase backend database.
 */
export function broadcastStateUpdate(payload) {
  if (!payload) return;

  // 1. Broadcast real-time message to other active devices (laptop/phone)
  if (liveChannel) {
    try {
      liveChannel.send({
        type: 'broadcast',
        event: 'FULL_STATE_UPDATE',
        payload
      }).catch(() => {});
    } catch (_) {}
  }

  // 2. Persist updated logs & stats to Supabase DB backend
  if (currentSubscribedUserId) {
    persistToSupabaseBackend(currentSubscribedUserId, payload);
  }
}

/**
 * Saves current logs & daily metrics to Supabase database (profiles table & user metadata)
 */
async function persistToSupabaseBackend(userId, payload) {
  if (!userId || !supabase) return;

  try {
    const currentState = useStore.getState();

    const dbPayload = {
      id: userId,
      water_intake: currentState.waterIntake,
      calories_consumed: currentState.caloriesConsumed,
      logged_foods: currentState.loggedFoods,
      workout_logs: currentState.workoutLogs,
      completed_workouts: currentState.completedWorkouts,
      sleep_hours: currentState.sleepHours,
      readiness_score: currentState.readinessScore,
      active_streak: currentState.activeStreak,
      wellness_logs: currentState.wellnessLogs,
      current_mood: currentState.currentMood,
      logged_symptoms: currentState.loggedSymptoms,
      updated_at: new Date().toISOString()
    };

    if (supabase.from) {
      await supabase.from('profiles').upsert(dbPayload, { onConflict: 'id' }).catch(() => {});
    }

    if (supabase.auth && supabase.auth.updateUser) {
      await supabase.auth.updateUser({
        data: {
          water_intake: currentState.waterIntake,
          calories_consumed: currentState.caloriesConsumed,
          logged_foods: currentState.loggedFoods,
          readiness_score: currentState.readinessScore,
          active_streak: currentState.activeStreak,
          last_sync: new Date().toISOString()
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Backend persistence notice:', err?.message);
  }
}

/**
 * Restores all daily logs and metrics from Supabase database when app opens
 */
async function fetchPersistedBackendState(userId) {
  if (!userId || !supabase) return;

  try {
    let profileData = null;

    if (supabase.from) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) profileData = data;
    }

    const { data: authData } = await supabase.auth.getUser().catch(() => ({}));
    const userMeta = authData?.user?.user_metadata || {};

    const updates = {};

    // Restore metrics from DB or user_metadata
    const dbWater = profileData?.water_intake ?? userMeta?.water_intake;
    if (typeof dbWater === 'number') updates.waterIntake = dbWater;

    const dbCalories = profileData?.calories_consumed ?? userMeta?.calories_consumed;
    if (typeof dbCalories === 'number') updates.caloriesConsumed = dbCalories;

    const dbFoods = profileData?.logged_foods ?? userMeta?.logged_foods;
    if (Array.isArray(dbFoods)) updates.loggedFoods = dbFoods;

    const dbWorkoutLogs = profileData?.workout_logs;
    if (Array.isArray(dbWorkoutLogs)) updates.workoutLogs = dbWorkoutLogs;

    const dbCompletedWorkouts = profileData?.completed_workouts;
    if (Array.isArray(dbCompletedWorkouts)) updates.completedWorkouts = dbCompletedWorkouts;

    const dbSleep = profileData?.sleep_hours;
    if (typeof dbSleep === 'number') updates.sleepHours = dbSleep;

    const dbReadiness = profileData?.readiness_score ?? userMeta?.readiness_score;
    if (typeof dbReadiness === 'number') updates.readinessScore = dbReadiness;

    const dbStreak = profileData?.active_streak ?? userMeta?.active_streak;
    if (typeof dbStreak === 'number') updates.activeStreak = dbStreak;

    const dbWellness = profileData?.wellness_logs;
    if (Array.isArray(dbWellness)) updates.wellnessLogs = dbWellness;

    if (Object.keys(updates).length > 0) {
      useStore.setState(updates);
    }
  } catch (err) {
    console.warn('Fetch backend state notice:', err?.message);
  }
}
