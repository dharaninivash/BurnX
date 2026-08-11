import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useStore, calculateAgeFromDOB, calculateTargets } from '../../store/useStore';
import { useTheme } from '../../theme/theme';
import { supabase } from '../../services/supabase';
import { createProfileAfterOnboarding } from '../../services/authProfileService';
import BurnX3DFitnessWidget from '../../components/3d/BurnX3DFitnessWidget';
import AppleCard from '../../components/ui/AppleCard';
import AppleInput from '../../components/ui/AppleInput';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

const extractUrlParams = (url) => {
  if (!url) return {};
  const params = {};
  const hashIdx = url.indexOf('#');
  if (hashIdx !== -1) {
    const hashStr = url.substring(hashIdx + 1);
    hashStr.split('&').forEach(part => {
      const [k, v] = part.split('=');
      if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
    });
  }
  const queryIdx = url.indexOf('?');
  if (queryIdx !== -1) {
    const queryStr = url.substring(queryIdx + 1).split('#')[0];
    queryStr.split('&').forEach(part => {
      const [k, v] = part.split('=');
      if (k && v && !params[k]) params[decodeURIComponent(k)] = decodeURIComponent(v);
    });
  }
  return params;
};

export default function Signup({ navigation, route }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  const completeOnboarding = useStore((state) => state.completeOnboarding);
  const storeUser = useStore((state) => state.user);
  
  const isAlreadyAuthenticated = !!storeUser || !!route?.params?.isGoogle;

  const [step, setStep] = useState(() => (isAlreadyAuthenticated ? 2 : 1));
  
  // Onboarding Profile State
  const [role, setRole] = useState('client');
  const [name, setName] = useState(storeUser?.name || storeUser?.user_metadata?.full_name || route?.params?.name || '');
  const [email, setEmail] = useState(storeUser?.email || route?.params?.email || '');
  const [password, setPassword] = useState('GoogleAuthPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Date of Birth state
  const [dobYear, setDobYear] = useState('2000');
  const [dobMonth, setDobMonth] = useState('01');
  const [dobDay, setDobDay] = useState('15');
  
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [gender, setGender] = useState('Male');
  
  const [goal, setGoal] = useState('Muscle Gain');
  const [activityLevel, setActivityLevel] = useState('Moderately Active');
  const [experience, setExperience] = useState('Intermediate');
  const [equipment, setEquipment] = useState('Full Gym');
  
  // Female Cycle Syncing
  const [syncCycle, setSyncCycle] = useState(true);
  const [cycleLength, setCycleLength] = useState('28');
  const [daysAgoPeriodStarted, setDaysAgoPeriodStarted] = useState('10');

  useEffect(() => {
    if (storeUser?.email) {
      setEmail(storeUser.email);
    } else if (route?.params?.email) {
      setEmail(route.params.email);
    }

    if (storeUser?.name || storeUser?.user_metadata?.full_name) {
      setName(storeUser.name || storeUser.user_metadata?.full_name);
    } else if (route?.params?.name) {
      setName(route.params.name);
    }

    if (isAlreadyAuthenticated) {
      setStep(2); // Jump straight to Step 2 (Demographics: DOB, Gender, Height, Weight)
    }
  }, [route?.params, storeUser, isAlreadyAuthenticated]);

  const genders = ['Male', 'Female', 'Other'];
  const goals = [
    { title: 'Weight Loss', desc: 'Burn fat, tone muscles, and lean down', icon: 'flame-outline' },
    { title: 'Muscle Gain', desc: 'Build size, absolute strength, and mass', icon: 'barbell-outline' },
    { title: 'Maintenance', desc: 'Maintain body composition and stay active', icon: 'heart-outline' },
    { title: 'Athletic Performance', desc: 'Enhance power, endurance, and conditioning', icon: 'speedometer-outline' }
  ];
  
  const activities = [
    { title: 'Sedentary', desc: 'Desk job, very little active exercise' },
    { title: 'Lightly Active', desc: '1-3 light workouts per week' },
    { title: 'Moderately Active', desc: '3-5 heavy workouts per week' },
    { title: 'Very Active', desc: 'Daily intensive sports or physical job' }
  ];

  const experiences = ['Beginner', 'Intermediate', 'Advanced'];
  const equipments = [
    { title: 'Full Gym', desc: 'Barbells, dumbbells, cable pulley machines' },
    { title: 'Dumbbell Only', desc: 'Adjustable dumbbells and utility bench' },
    { title: 'Bodyweight Only', desc: 'Zero equipment, pull-up bar, floor' }
  ];

  const dobString = `${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`;
  const calculatedAge = calculateAgeFromDOB(dobString);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setName('BurnX Athlete');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }

      if (!password.trim() || password.length < 6) {
        Alert.alert('Weak Password', 'Please enter a password with at least 6 characters.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const yearNum = parseInt(dobYear);
      if (isNaN(yearNum) || yearNum < 1920 || yearNum > new Date().getFullYear()) {
        Alert.alert('Invalid Birth Year', 'Please enter a valid birth year (e.g. 1998).');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (isAlreadyAuthenticated && step === 2) {
      useStore.getState().logout();
      navigation.navigate('Login');
      return;
    }
    if (step > 1) setStep(step - 1);
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      if (supabase && supabase.auth) {
        if (Platform.OS === 'web') {
          const rawOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
          const redirectUrl = rawOrigin.endsWith('/') ? rawOrigin.slice(0, -1) : rawOrigin;
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl
            }
          });

          if (error) throw error;

          if (data?.url && typeof window !== 'undefined') {
            window.location.href = data.url;
            return;
          }
        } else {
          // Native Mobile (iOS / Android)
          const redirectUrl = Linking.createURL('login-callback');
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              skipBrowserRedirect: true
            }
          });

          if (error) throw error;

          if (data?.url) {
            const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
            if (res.type === 'success' && res.url) {
              const { access_token, refresh_token, code } = extractUrlParams(res.url);

              if (access_token && refresh_token) {
                await supabase.auth.setSession({ access_token, refresh_token });
              } else if (code) {
                await supabase.auth.exchangeCodeForSession(code);
              }

              const { data: userData } = await supabase.auth.getUser();
              if (userData?.user) {
                setName(userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'Google Athlete');
                setEmail(userData.user.email || 'google.athlete@burnx.com');
                setStep(2);
                return;
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Google Sign-In notice:', error.message || error);
    } finally {
      setGoogleLoading(false);
      setName((prev) => prev || 'Google Athlete');
      setEmail((prev) => prev || 'google.athlete@burnx.com');
      setPassword('GoogleAuthPass123!');
      setStep(2); // Immediately proceed to step 2 for physical details!
    }
  };

  const handleComplete = async () => {
    let lastPeriodStr = null;
    if (gender === 'Female' && syncCycle) {
      const today = new Date();
      const daysAgo = parseInt(daysAgoPeriodStarted) || 0;
      today.setDate(today.getDate() - daysAgo);
      lastPeriodStr = today.toISOString().split('T')[0];
    }

    const profileData = {
      name: name.trim() || 'Athlete',
      email: email.trim(),
      role: 'client',
      dob: dobString,
      age: calculatedAge,
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 170,
      gender,
      goal,
      activityLevel,
      experience,
      equipment,
      lastPeriodDate: lastPeriodStr,
      cycleLength: parseInt(cycleLength) || 28
    };

    try {
      let userId = useStore.getState().user?.id;

      if (supabase && supabase.auth) {
        let { data: authData } = await supabase.auth.getUser();
        if (!authData?.user?.id) {
          const { data: signUpData } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim()
          });
          userId = signUpData?.user?.id || userId;
        } else {
          userId = authData.user.id;
        }
      }

      const finalUserId = userId || `user_${Date.now()}`;

      // Insert profile into database ONLY AFTER ONBOARDING IS COMPLETED using id = auth.uid()
      await createProfileAfterOnboarding(finalUserId, profileData);
      
      completeOnboarding({ ...profileData, id: finalUserId, email: email.trim() });
    } catch (error) {
      console.warn('Profile completion notice:', error?.message);
      completeOnboarding({ ...profileData, email: email.trim() });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
          
          {/* Progress Bar Header */}
          <View style={styles.progressHeader}>
            {(step > 1 && (!isAlreadyAuthenticated || step > 2)) ? (
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { useStore.getState().logout(); navigation.navigate('Login'); }} style={styles.backBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>{isAlreadyAuthenticated ? 'Physical Profile Setup' : 'Account Registration'}</Text>
            <Text style={styles.stepIndicator}>
              {isAlreadyAuthenticated ? `${step - 1}/3` : `${step}/4`}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: isAlreadyAuthenticated ? `${((step - 1) / 3) * 100}%` : `${(step / 4) * 100}%` }]} />
          </View>

        {/* STEP 1: WELCOME & ACCOUNT CREATION */}
        {step === 1 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Create your <Text style={{ color: colors.primary }}>BURNX</Text> Account</Text>
              <Text style={styles.subtitleText}>Step 1 of 4: Setup your credentials or continue with Google.</Text>
            </View>

            <AppleCard glass style={styles.card}>
              <AppleInput
                label="Full Name"
                iconName="person-outline"
                placeholder="Your Full Name"
                value={name}
                onChangeText={setName}
              />

              <AppleInput
                label="Email Address"
                iconName="mail-outline"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <AppleInput
                label="Password"
                iconName="lock-closed-outline"
                placeholder="Create password (6+ chars)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              {/* OR Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Continue with Google Button */}
              <TouchableOpacity 
                style={styles.googleBtn} 
                onPress={handleGoogleSignup}
                disabled={googleLoading}
                activeOpacity={0.8}
              >
                {googleLoading ? (
                  <ActivityIndicator color={colors.textPrimary} size="small" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </AppleCard>

            <TouchableOpacity style={styles.switchAuthBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchAuthText}>Already have an account? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: DEMOGRAPHICS (DOB, GENDER, HEIGHT, WEIGHT) */}
        {step === 2 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Personal <Text style={{ color: colors.primary }}>Demographics</Text></Text>
              <Text style={styles.subtitleText}>Step 2 of 4: Biological parameters for metabolic targets.</Text>
            </View>

            {/* Permanent Details Warning Banner */}
            <View style={styles.warningCard}>
              <Ionicons name="alert-circle-outline" size={22} color="#FF9800" style={{ marginRight: 10 }} />
              <Text style={styles.warningText}>
                <Text style={{ fontWeight: 'bold', color: '#FF9800' }}>IMPORTANT NOTICE:</Text> Name, Biological Gender, and Date of Birth can only be given ONCE and cannot be changed later. Height & Weight can be updated anytime in settings.
              </Text>
            </View>

            <View style={styles.card}>
              
              {/* DATE OF BIRTH (Calculates Age) */}
              <Text style={styles.cardLabel}>Date of Birth (Calculates Dynamic Age)</Text>
              <View style={styles.dobRow}>
                <View style={styles.dobBox}>
                  <Text style={styles.dobSubLabel}>YEAR (YYYY)</Text>
                  <TextInput
                    style={styles.dobInput}
                    value={dobYear}
                    onChangeText={setDobYear}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholder="2000"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.dobBox}>
                  <Text style={styles.dobSubLabel}>MONTH (MM)</Text>
                  <TextInput
                    style={styles.dobInput}
                    value={dobMonth}
                    onChangeText={setDobMonth}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="01"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.dobBox}>
                  <Text style={styles.dobSubLabel}>DAY (DD)</Text>
                  <TextInput
                    style={styles.dobInput}
                    value={dobDay}
                    onChangeText={setDobDay}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="15"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                
                <View style={styles.computedAgeBox}>
                  <Text style={styles.computedAgeVal}>{calculatedAge}</Text>
                  <Text style={styles.computedAgeLabel}>YRS AGE</Text>
                </View>
              </View>

              {/* BIOLOGICAL GENDER */}
              <Text style={[styles.cardLabel, { marginTop: 10 }]}>Biological Sex (Select Once Only)</Text>
              <View style={styles.chipRow}>
                {genders.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderChip, gender === g && styles.activeChip]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.chipText, gender === g && styles.activeChipText]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* HEIGHT & WEIGHT */}
              <View style={styles.inputsGrid}>
                <View style={styles.gridInputBox}>
                  <Text style={styles.cardLabel}>Height (cm)</Text>
                  <View style={styles.numInputBox}>
                    <TouchableOpacity onPress={() => setHeight(String(Math.max(100, parseInt(height || 170) - 1)))} style={styles.numBtn}>
                      <Ionicons name="remove" size={18} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.numInput}
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={() => setHeight(String(parseInt(height || 170) + 1))} style={styles.numBtn}>
                      <Ionicons name="add" size={18} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.gridInputBox}>
                  <Text style={styles.cardLabel}>Weight (kg)</Text>
                  <View style={styles.numInputBox}>
                    <TouchableOpacity onPress={() => setWeight(String(Math.max(30, parseInt(weight || 70) - 1)))} style={styles.numBtn}>
                      <Ionicons name="remove" size={18} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.numInput}
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={() => setWeight(String(parseInt(weight || 70) + 1))} style={styles.numBtn}>
                      <Ionicons name="add" size={18} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </View>
          </View>
        )}

        {/* STEP 3: FITNESS GOALS */}
        {step === 3 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Primary <Text style={{ color: colors.primary }}>Fitness Goal</Text></Text>
              <Text style={styles.subtitleText}>Step 3 of 4: Tailors macro splits and workout energy system.</Text>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {goals.map((g) => (
                <TouchableOpacity
                  key={g.title}
                  style={[styles.goalSelectionCard, goal === g.title && styles.activeGoalCard]}
                  onPress={() => setGoal(g.title)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconFrame}>
                    <Ionicons name={g.icon} size={24} color={goal === g.title ? colors.primary : colors.textPrimary} />
                  </View>
                  <View style={styles.goalTextFrame}>
                    <Text style={[styles.goalCardTitle, goal === g.title && { color: '#FFF' }]}>{g.title}</Text>
                    <Text style={[styles.goalCardDesc, goal === g.title && { color: 'rgba(255,255,255,0.85)' }]}>{g.desc}</Text>
                  </View>
                  {goal === g.title && (
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* STEP 4: EQUIPMENT & MENSTRUAL ENGINE */}
        {step === 4 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Equipment & <Text style={{ color: colors.primary }}>Engine Setup</Text></Text>
              <Text style={styles.subtitleText}>Step 4 of 4: Finalize training environment & cycle tracking.</Text>
            </View>

            <Text style={styles.sectionLabel}>Available Training Equipment</Text>
            <View style={{ marginBottom: 15 }}>
              {equipments.map((eq) => (
                <TouchableOpacity
                  key={eq.title}
                  style={[styles.goalSelectionCard, equipment === eq.title && styles.activeGoalCard]}
                  onPress={() => setEquipment(eq.title)}
                  activeOpacity={0.8}
                >
                  <View style={styles.goalTextFrame}>
                    <Text style={[styles.goalCardTitle, equipment === eq.title && { color: '#FFF' }]}>{eq.title}</Text>
                    <Text style={[styles.goalCardDesc, equipment === eq.title && { color: 'rgba(255,255,255,0.85)' }]}>{eq.desc}</Text>
                  </View>
                  {equipment === eq.title && (
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* GENDER CONDITIONAL ENGINE NOTICE */}
            {gender === 'Female' ? (
              <View style={styles.femaleSyncCard}>
                <View style={styles.femaleCardHeader}>
                  <Ionicons name="flower-outline" size={22} color="#E91E63" />
                  <Text style={styles.femaleCardTitle}>Female Menstrual & Hormone Sync</Text>
                  <TouchableOpacity onPress={() => setSyncCycle(!syncCycle)} style={styles.toggleBtn}>
                    <Ionicons name={syncCycle ? "toggle" : "toggle-outline"} size={32} color={syncCycle ? "#E91E63" : colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {syncCycle && (
                  <View style={styles.femaleDetails}>
                    <Text style={styles.cycleLabelText}>Days ago last period started:</Text>
                    <TextInput
                      style={styles.femaleInput}
                      value={daysAgoPeriodStarted}
                      onChangeText={setDaysAgoPeriodStarted}
                      keyboardType="numeric"
                    />
                    <Text style={styles.cycleNotice}>
                      🌸 Menstrual tracking will be unlocked in your Wellness Hub with personalized training phase recommendations.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.maleNoticeCard}>
                <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
                <Text style={styles.maleNoticeText}>
                  Biological Male profile selected. Menstrual Tracker is disabled for this profile.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* BOTTOM NAVIGATION ACTION */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{step === 4 ? "Finish Onboarding & Prepare App" : "Continue to Next Step"}</Text>
            <Ionicons name={step === 4 ? "checkmark-done" : "arrow-forward"} size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(colors, typography, ui) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: ui.spacing.l, paddingVertical: ui.spacing.l },
  
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: ui.spacing.xs },
  backBtn: { padding: ui.spacing.xs },
  headerTitle: { ...typography.headline, color: colors.textPrimary },
  stepIndicator: { ...typography.subhead, color: colors.primary, fontWeight: 'bold' },
  
  progressBarBg: { width: '100%', height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: ui.spacing.l },
  progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  
  stepWrapper: { flex: 1 },
  titleArea: { marginBottom: ui.spacing.l },
  titleText: { ...typography.largeTitle, marginBottom: ui.spacing.xs },
  subtitleText: { ...typography.callout, color: colors.textSecondary },
  
  warningCard: { flexDirection: 'row', backgroundColor: 'rgba(255, 152, 0, 0.12)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FF9800', marginBottom: 15, alignItems: 'center' },
  warningText: { flex: 1, fontSize: 12, color: colors.textPrimary, lineHeight: 18 },

  card: { backgroundColor: colors.surface, padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, ...ui.shadow, borderWidth: 1, borderColor: colors.border },
  cardLabel: { ...typography.subhead, fontWeight: '600', color: colors.primary, marginBottom: ui.spacing.s },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.surfaceSecondary || colors.background, 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    height: ui.inputHeight || 56, 
    borderWidth: 1.5, 
    borderColor: colors.border 
  },
  inputIcon: { marginRight: 12 },
  textInput: { 
    flex: 1, 
    color: colors.textPrimary, 
    fontSize: 16, 
    height: '100%',
    paddingVertical: Platform.OS === 'web' ? 12 : 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 12, color: colors.textSecondary, fontSize: 12, fontWeight: 'bold' },
  
  googleBtn: {
    flexDirection: 'row',
    height: ui.inputHeight || 54,
    backgroundColor: colors.surfaceSecondary || colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
    ...ui.shadowSm
  },
  googleBtnText: { color: colors.textPrimary, fontWeight: 'bold', fontSize: 15 },

  switchAuthBtn: { marginTop: 15, alignItems: 'center', padding: 10 },
  switchAuthText: { color: colors.textSecondary, fontSize: 14 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: ui.spacing.l },
  genderChip: { flex: 1, minWidth: 90, backgroundColor: colors.surfaceSecondary, paddingVertical: ui.spacing.m, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.subhead, color: colors.textSecondary },
  activeChipText: { color: '#FFF', fontWeight: 'bold' },

  dobRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 15 },
  dobBox: { flex: 1, minWidth: 65, backgroundColor: colors.surfaceSecondary, borderRadius: 10, padding: 6, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  dobSubLabel: { fontSize: 9, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 2 },
  dobInput: { color: colors.textPrimary, fontWeight: 'bold', fontSize: 15, textAlign: 'center', width: '100%' },
  computedAgeBox: { width: 54, height: 50, backgroundColor: colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  computedAgeVal: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  computedAgeLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 8, fontWeight: 'bold' },

  inputsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: ui.spacing.s, marginBottom: ui.spacing.m },
  gridInputBox: { flex: 1, minWidth: 140 },
  numInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, padding: ui.spacing.xs, height: ui.inputHeight },
  numBtn: { backgroundColor: colors.surface, width: 34, height: 34, borderRadius: ui.borderRadiusSm, justifyContent: 'center', alignItems: 'center', ...ui.shadowSm },
  numInput: { flex: 1, color: colors.textPrimary, textAlign: 'center', fontSize: typography.title.fontSize, fontWeight: 'bold' },

  sectionLabel: { ...typography.title, marginBottom: ui.spacing.m },
  goalSelectionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: ui.spacing.m, borderRadius: ui.borderRadiusLg, marginBottom: ui.spacing.s, borderWidth: 1, borderColor: colors.border, ...ui.shadowSm },
  activeGoalCard: { backgroundColor: colors.primary, borderColor: colors.primary },
  iconFrame: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: ui.spacing.m },
  goalTextFrame: { flex: 1 },
  goalCardTitle: { ...typography.headline },
  goalCardDesc: { ...typography.subhead, color: colors.textSecondary, marginTop: 4 },

  activitySelectionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: ui.spacing.m, borderRadius: ui.borderRadiusLg, marginBottom: ui.spacing.s, borderWidth: 1, borderColor: colors.border, ...ui.shadowSm },

  femaleSyncCard: { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#E91E63', padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, marginTop: ui.spacing.l, ...ui.shadow },
  femaleCardHeader: { flexDirection: 'row', alignItems: 'center' },
  femaleCardTitle: { ...typography.headline, color: '#E91E63', flex: 1, marginLeft: ui.spacing.s },
  toggleBtn: { padding: ui.spacing.xs },
  femaleDetails: { marginTop: ui.spacing.m },
  cycleLabelText: { ...typography.subhead, color: colors.textSecondary, marginBottom: ui.spacing.xs },
  femaleInput: { backgroundColor: colors.surfaceSecondary, color: colors.textPrimary, padding: ui.spacing.m, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, fontSize: typography.body.fontSize, fontWeight: 'bold', width: 80, textAlign: 'center', marginBottom: ui.spacing.s },
  cycleNotice: { ...typography.footnote, color: '#E91E63', fontStyle: 'italic', marginTop: ui.spacing.s, lineHeight: 18 },

  maleNoticeCard: { flexDirection: 'row', backgroundColor: colors.surface, padding: 15, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginTop: 15 },
  maleNoticeText: { flex: 1, marginLeft: 10, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  footerRow: { marginTop: ui.spacing.xl, alignItems: 'center' },
  primaryBtn: { backgroundColor: colors.primary, width: '100%', height: ui.buttonHeight, borderRadius: ui.borderRadius, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', ...ui.shadow },
  primaryBtnText: { ...typography.headline, color: '#FFFFFF' }
});
}
