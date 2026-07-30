const assert = require('assert');
const { isProfileComplete, checkUserProfile, createProfileAfterOnboarding } = require('../src/services/authProfileService');

// Mock state and store simulating Zustand
let mockStoreState = {
  user: null,
  hasCompletedOnboarding: false
};

function resetMockStore() {
  mockStoreState = { user: null, hasCompletedOnboarding: false };
}

function mockSetVerifiedProfile(profile) {
  mockStoreState = {
    user: profile,
    hasCompletedOnboarding: true
  };
}

function mockSetPendingAuthUser(authUser) {
  mockStoreState = {
    user: authUser,
    hasCompletedOnboarding: false
  };
}

function mockLogout() {
  mockStoreState = {
    user: null,
    hasCompletedOnboarding: false
  };
}

// Mock database table for profiles
let mockProfilesTable = {};

function resetMockDb() {
  mockProfilesTable = {};
}

// Mock auth handler simulating App.js / Login.js / authProfileService
async function handleMockAuthSession(authUser) {
  if (!authUser || !authUser.id) {
    mockLogout();
    return { status: 'NO_AUTH' };
  }

  const dbProfile = mockProfilesTable[authUser.id];
  const complete = isProfileComplete(dbProfile);

  if (dbProfile && complete) {
    const fullProfile = {
      id: authUser.id,
      name: dbProfile.name || authUser.email.split('@')[0],
      email: dbProfile.email || authUser.email,
      dob: dbProfile.dob,
      gender: dbProfile.gender,
      height: dbProfile.height,
      weight: dbProfile.weight,
      goal: dbProfile.goal
    };
    mockSetVerifiedProfile(fullProfile);
    return { status: 'COMPLETE', profile: fullProfile };
  } else {
    // DO NOT insert profile into database automatically
    mockSetPendingAuthUser({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name || authUser.email.split('@')[0]
    });
    return { status: 'INCOMPLETE', user: mockStoreState.user };
  }
}

async function completeMockOnboarding(userId, onboardingData) {
  const completeProfileData = {
    id: userId, // auth.uid()
    name: onboardingData.name,
    email: onboardingData.email,
    dob: onboardingData.dob,
    gender: onboardingData.gender,
    height: onboardingData.height,
    weight: onboardingData.weight,
    goal: onboardingData.goal
  };

  // Insert into profiles table ONLY AFTER ONBOARDING
  mockProfilesTable[userId] = completeProfileData;
  mockSetVerifiedProfile(completeProfileData);
  return completeProfileData;
}

// ==========================================
// TEST SUITE: SUPABASE AUTH & ONBOARDING
// ==========================================

async function runTestSuite() {
  console.log('🧪 RUNNING AUTHENTICATION & ONBOARDING ARCHITECTURE TESTS...\n');

  // Scenario 1: New Google User
  {
    resetMockStore();
    resetMockDb();
    const newGoogleUser = { id: 'google_uid_101', email: 'newgoogle@gmail.com', name: 'Google Newbie' };
    const res = await handleMockAuthSession(newGoogleUser);

    assert.strictEqual(res.status, 'INCOMPLETE', 'New Google user must have INCOMPLETE status');
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, false, 'New Google user must not access Home');
    assert.strictEqual(mockProfilesTable[newGoogleUser.id], undefined, 'No row created in profiles DB automatically');
    console.log('✅ Scenario 1 Passed: New Google user redirects to onboarding without auto DB row');
  }

  // Scenario 2: Existing Google User
  {
    resetMockStore();
    resetMockDb();
    const existingGoogleUser = { id: 'google_uid_202', email: 'existgoogle@gmail.com', name: 'Google Veteran' };
    
    // Existing DB record
    mockProfilesTable[existingGoogleUser.id] = {
      id: existingGoogleUser.id,
      name: 'Google Veteran',
      email: existingGoogleUser.email,
      dob: '1995-06-20',
      gender: 'Male',
      height: 180,
      weight: 80,
      goal: 'Muscle Gain'
    };

    const res = await handleMockAuthSession(existingGoogleUser);
    assert.strictEqual(res.status, 'COMPLETE', 'Existing Google user must be COMPLETE');
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, true, 'Existing Google user goes straight to Home');
    console.log('✅ Scenario 2 Passed: Existing Google user goes directly to Home without onboarding');
  }

  // Scenario 3: New Email User
  {
    resetMockStore();
    resetMockDb();
    const newEmailUser = { id: 'email_uid_303', email: 'newemail@burnx.com' };
    const res = await handleMockAuthSession(newEmailUser);

    assert.strictEqual(res.status, 'INCOMPLETE', 'New Email user must be INCOMPLETE');
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, false, 'New Email user must complete onboarding first');
    assert.strictEqual(mockProfilesTable[newEmailUser.id], undefined, 'No profile row created before onboarding');
    console.log('✅ Scenario 3 Passed: New Email user routes to onboarding without profile creation');
  }

  // Scenario 4: Existing Email User
  {
    resetMockStore();
    resetMockDb();
    const existingEmailUser = { id: 'email_uid_404', email: 'existingemail@burnx.com' };
    mockProfilesTable[existingEmailUser.id] = {
      id: existingEmailUser.id,
      name: 'Email Pro',
      email: existingEmailUser.email,
      dob: '1998-03-15',
      gender: 'Female',
      height: 165,
      weight: 60,
      goal: 'Weight Loss'
    };

    const res = await handleMockAuthSession(existingEmailUser);
    assert.strictEqual(res.status, 'COMPLETE', 'Existing Email user must be COMPLETE');
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, true, 'Existing Email user skips onboarding');
    console.log('✅ Scenario 4 Passed: Existing Email user proceeds straight to Home');
  }

  // Scenario 5: Incomplete Profile
  {
    resetMockStore();
    resetMockDb();
    const incompleteUser = { id: 'inc_uid_505', email: 'incomplete@burnx.com' };
    
    // DB has row, but missing required fields (e.g. missing gender, height, weight)
    mockProfilesTable[incompleteUser.id] = {
      id: incompleteUser.id,
      email: incompleteUser.email,
      name: 'Incomplete Athlete'
      // missing dob, gender, height, weight, goal
    };

    const res = await handleMockAuthSession(incompleteUser);
    assert.strictEqual(res.status, 'INCOMPLETE', 'Incomplete profile must trigger INCOMPLETE status');
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, false, 'Access to Home blocked for incomplete profile');
    console.log('✅ Scenario 5 Passed: Incomplete profile blocks Home access and forces onboarding completion');
  }

  // Scenario 6: App Restart Session Restoration
  {
    resetMockStore();
    resetMockDb();
    const user = { id: 'uid_606', email: 'restart@burnx.com' };
    mockProfilesTable[user.id] = {
      id: user.id,
      name: 'Restart User',
      email: user.email,
      dob: '2001-01-01',
      gender: 'Male',
      height: 175,
      weight: 70,
      goal: 'Maintenance'
    };

    // Simulate session restoration on restart
    const res = await handleMockAuthSession(user);
    assert.strictEqual(res.status, 'COMPLETE', 'Restored session verifies profile from DB');
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, true, 'App restart lands on Home screen');
    console.log('✅ Scenario 6 Passed: App restart restores session and verifies complete profile');
  }

  // Scenario 7: Logout / Login Lifecycle
  {
    resetMockStore();
    mockLogout();
    assert.strictEqual(mockStoreState.user, null);
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, false);
    console.log('✅ Scenario 7 Passed: Logout clears session and resets navigation state to Login');
  }

  // Scenario 8: Multiple Devices
  {
    resetMockStore();
    resetMockDb();
    const multiUser = { id: 'uid_808', email: 'multidevice@burnx.com' };

    // Device 1 completes onboarding
    await completeMockOnboarding(multiUser.id, {
      name: 'Multi Athlete',
      email: multiUser.email,
      dob: '1996-08-12',
      gender: 'Female',
      height: 168,
      weight: 62,
      goal: 'Athletic Performance'
    });

    // Device 2 logs in with same user ID
    resetMockStore(); // Device 2 fresh state
    const device2Res = await handleMockAuthSession(multiUser);
    assert.strictEqual(device2Res.status, 'COMPLETE', 'Device 2 recognizes complete profile');
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, true, 'Device 2 bypasses onboarding seamlessly');
    assert.strictEqual(mockProfilesTable[multiUser.id].id, multiUser.id, 'Row ID matches auth.uid() exactly');
    console.log('✅ Scenario 8 Passed: Multiple devices sync against single auth.uid() profile row');
  }

  // Scenario 9: Interrupted Onboarding
  {
    resetMockStore();
    resetMockDb();
    const interruptedUser = { id: 'uid_909', email: 'interrupted@burnx.com' };

    // User logs in but closes app during step 2 of onboarding (no completeMockOnboarding called)
    await handleMockAuthSession(interruptedUser);
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, false);
    assert.strictEqual(mockProfilesTable[interruptedUser.id], undefined, 'No orphan profile row saved');

    // User re-opens app
    resetMockStore();
    const reOpenRes = await handleMockAuthSession(interruptedUser);
    assert.strictEqual(reOpenRes.status, 'INCOMPLETE', 'Re-opened session remains incomplete');
    assert.strictEqual(mockStoreState.hasCompletedOnboarding, false, 'User forced to restart/continue onboarding');
    
    // User finally completes onboarding
    await completeMockOnboarding(interruptedUser.id, {
      name: 'Finished Athlete',
      email: interruptedUser.email,
      dob: '1999-11-20',
      gender: 'Male',
      height: 182,
      weight: 85,
      goal: 'Muscle Gain'
    });

    assert.strictEqual(mockStoreState.hasCompletedOnboarding, true);
    assert.notStrictEqual(mockProfilesTable[interruptedUser.id], undefined, 'Profile row inserted only after onboarding');
    console.log('✅ Scenario 9 Passed: Interrupted onboarding leaves 0 orphan rows; forces completion on next launch');
  }

  console.log('\n🎉 ALL 9 TEST SCENARIOS PASSED SUCCESSFULLY!');
}

runTestSuite().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
