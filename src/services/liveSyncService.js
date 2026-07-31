import { supabase } from './supabase';
import { useStore } from '../store/useStore';

let liveChannel = null;
let currentSubscribedUserId = null;

/**
 * Initializes a Supabase Realtime broadcast channel for the logged-in user.
 * Allows instant live updates between phone, laptop, and desktop browsers.
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
    const channelName = `burnx_sync_${userId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    liveChannel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false } // Receive events sent by other devices of the same user
      }
    });

    liveChannel
      .on('broadcast', { event: 'USER_STATE_UPDATE' }, ({ payload }) => {
        if (!payload) return;

        // Instantly update Zustand state on this device
        const stateUpdates = {};
        if (typeof payload.waterIntake === 'number') stateUpdates.waterIntake = payload.waterIntake;
        if (typeof payload.caloriesConsumed === 'number') stateUpdates.caloriesConsumed = payload.caloriesConsumed;
        if (Array.isArray(payload.loggedFoods)) stateUpdates.loggedFoods = payload.loggedFoods;
        if (typeof payload.readinessScore === 'number') stateUpdates.readinessScore = payload.readinessScore;

        if (Object.keys(stateUpdates).length > 0) {
          useStore.setState(stateUpdates);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ BurnX Live Sync Active for user:', userId);
        }
      });

    // Also fetch initial synced water & stats from user_metadata
    supabase.auth.getUser().then(({ data }) => {
      const userMeta = data?.user?.user_metadata || {};
      const updates = {};
      if (typeof userMeta.water_intake === 'number') {
        updates.waterIntake = userMeta.water_intake;
      }
      if (typeof userMeta.calories_consumed === 'number') {
        updates.caloriesConsumed = userMeta.calories_consumed;
      }
      if (Object.keys(updates).length > 0) {
        useStore.setState(updates);
      }
    }).catch(() => {});

  } catch (e) {
    console.warn('Live sync initialization notice:', e?.message);
  }
}

/**
 * Broadcasts a state change (e.g. water intake update) to all connected devices of the user.
 */
export function broadcastStateUpdate(payload) {
  if (!payload) return;

  // 1. Broadcast event over Supabase Realtime channel to other devices
  if (liveChannel) {
    try {
      liveChannel.send({
        type: 'broadcast',
        event: 'USER_STATE_UPDATE',
        payload
      }).catch(() => {});
    } catch (_) {}
  }

  // 2. Persist updated water intake to Supabase user metadata so newly opened browsers fetch it
  if (supabase && supabase.auth && typeof payload.waterIntake === 'number') {
    try {
      supabase.auth.updateUser({
        data: {
          water_intake: payload.waterIntake,
          last_sync: new Date().toISOString()
        }
      }).catch(() => {});
    } catch (_) {}
  }
}
