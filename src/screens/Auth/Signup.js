import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore, calculateAgeFromDOB, calculateTargets } from '../../store/useStore';
import { useTheme } from '../../theme/theme';
import { supabase } from '../../services/supabase';

const { width } = Dimensions.get('window');

export default function Signup({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const completeOnboarding = useStore((state) => state.completeOnboarding);
  
  const [step, setStep] = useState(1);
  
  // Onboarding Profile State
  const [role, setRole] = useState('client'); // 'client' | 'trainer' | 'admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
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
    if (step > 1) setStep(step - 1);
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
      role: role || 'client',
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

    const targets = calculateTargets(profileData);

    try {
      if (supabase && supabase.auth) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: { ...profileData, calorieTarget: targets.calories }
          }
        });

        if (!error && data?.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: profileData.name,
            email: profileData.email,
            gender: profileData.gender,
            dob: profileData.dob,
            age: profileData.age,
            height: profileData.height,
            weight: profileData.weight,
            goal: profileData.goal,
            activity_level: profileData.activityLevel,
            calorie_target: targets.calories,
            protein_target: targets.protein,
            carbs_target: targets.carbs,
            fats_target: targets.fats,
            created_at: new Date().toISOString()
          }).catch((err) => console.log('Profile DB notice:', err?.message));
        }
      }
    } catch (error) {
      console.warn('Supabase offline or unreachable:', error?.message);
    } finally {
      completeOnboarding({ ...profileData, email: email.trim() });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Progress Bar Header */}
          <View style={styles.progressHeader}>
            {step > 1 ? (
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Account Registration</Text>
            <Text style={styles.stepIndicator}>{step}/4</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
          </View>

        {/* STEP 1: WELCOME & ACCOUNT CREATION */}
        {step === 1 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Create your <Text style={{ color: colors.primary }}>BURNX</Text> Account</Text>
              <Text style={styles.subtitleText}>Step 1 of 4: Setup your credentials.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Your Full Name"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={[styles.cardLabel, { marginTop: 15 }]}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={[styles.cardLabel, { marginTop: 15 }]}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Create password (6+ chars)"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 6 }}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

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
              <Ionicons name="shield-alert-outline" size={22} color="#FF9800" style={{ marginRight: 10 }} />
              <Text style={styles.warningText}>
                <Text style={{ fontWeight: 'bold', color: '#FF9800' }}>Important Notice: </Text>
                Your Name, Biological Gender, and Date of Birth can only be set ONCE during registration and CANNOT be changed later. Height and Weight can be updated anytime.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Biological Gender (Locked after selection)</Text>
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

              {/* Date of Birth Input (YYYY - MM - DD) */}
              <Text style={[styles.cardLabel, { marginTop: 10 }]}>Date of Birth (Calculates exact age)</Text>
              <View style={styles.dobRow}>
                <View style={styles.dobBox}>
                  <Text style={styles.dobSubLabel}>YYYY</Text>
                  <TextInput
                    style={styles.dobInput}
                    keyboardType="numeric"
                    maxLength={4}
                    value={dobYear}
                    onChangeText={setDobYear}
                    placeholder="2000"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.dobBox}>
                  <Text style={styles.dobSubLabel}>MM</Text>
                  <TextInput
                    style={styles.dobInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={dobMonth}
                    onChangeText={setDobMonth}
                    placeholder="01"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.dobBox}>
                  <Text style={styles.dobSubLabel}>DD</Text>
                  <TextInput
                    style={styles.dobInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={dobDay}
                    onChangeText={setDobDay}
                    placeholder="15"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.computedAgeBox}>
                  <Text style={styles.computedAgeVal}>{calculatedAge}</Text>
                  <Text style={styles.computedAgeLabel}>AGE</Text>
                </View>
              </View>

              {/* Height & Weight */}
              <View style={styles.inputsGrid}>
                <View style={styles.gridInputBox}>
                  <Text style={styles.cardLabel}>Height (cm)</Text>
                  <View style={styles.numInputBox}>
                    <TouchableOpacity onPress={() => setHeight(String(Math.max(100, parseInt(height) - 1)))} style={styles.numBtn}>
                      <Ionicons name="remove" size={18} color="#FFF" />
                    </TouchableOpacity>
                    <TextInput style={styles.numInput} keyboardType="numeric" value={height} onChangeText={setHeight} />
                    <TouchableOpacity onPress={() => setHeight(String(Math.min(250, parseInt(height) + 1)))} style={styles.numBtn}>
                      <Ionicons name="add" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.gridInputBox}>
                  <Text style={styles.cardLabel}>Weight (kg)</Text>
                  <View style={styles.numInputBox}>
                    <TouchableOpacity onPress={() => setWeight(String(Math.max(30, parseFloat(weight) - 0.5)))} style={styles.numBtn}>
                      <Ionicons name="remove" size={18} color="#FFF" />
                    </TouchableOpacity>
                    <TextInput style={styles.numInput} keyboardType="numeric" value={weight} onChangeText={setWeight} />
                    <TouchableOpacity onPress={() => setWeight(String(Math.min(200, parseFloat(weight) + 0.5)))} style={styles.numBtn}>
                      <Ionicons name="add" size={18} color="#FFF" />
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
              <Text style={styles.titleText}>Choose your <Text style={{ color: colors.primary }}>Training Goal</Text></Text>
              <Text style={styles.subtitleText}>Step 3 of 4: Calorie and macro target calculation.</Text>
            </View>

            <Text style={styles.sectionLabel}>Primary Fitness Goal</Text>
            {goals.map((g) => (
              <TouchableOpacity
                key={g.title}
                style={[styles.goalSelectionCard, goal === g.title && styles.activeGoalCard]}
                onPress={() => setGoal(g.title)}
              >
                <View style={[styles.iconFrame, goal === g.title && { backgroundColor: colors.textPrimary }]}>
                  <Ionicons name={g.icon} size={24} color={goal === g.title ? colors.background : colors.primary} />
                </View>
                <View style={styles.goalTextFrame}>
                  <Text style={[styles.goalCardTitle, goal === g.title && { color: colors.background }]}>{g.title}</Text>
                  <Text style={[styles.goalCardDesc, goal === g.title && { color: 'rgba(0,0,0,0.6)' }]}>{g.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionLabel, { marginTop: 15 }]}>Activity Level</Text>
            {activities.map((act) => (
              <TouchableOpacity
                key={act.title}
                style={[styles.activitySelectionCard, activityLevel === act.title && styles.activeGoalCard]}
                onPress={() => setActivityLevel(act.title)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalCardTitle, activityLevel === act.title && { color: colors.background }]}>{act.title}</Text>
                  <Text style={[styles.goalCardDesc, activityLevel === act.title && { color: 'rgba(0,0,0,0.6)' }]}>{act.desc}</Text>
                </View>
                {activityLevel === act.title && <Ionicons name="checkmark-circle" size={24} color={colors.background} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 4: PREFERENCES & FEMALE CYCLE SYNC */}
        {step === 4 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Training Preferences & <Text style={{ color: colors.primary }}>Cycle Syncing</Text></Text>
              <Text style={styles.subtitleText}>Step 4 of 4: Finalizing parameters.</Text>
            </View>

            <Text style={styles.sectionLabel}>Workout Experience</Text>
            <View style={styles.chipRow}>
              {experiences.map((exp) => (
                <TouchableOpacity
                  key={exp}
                  style={[styles.genderChip, experience === exp && styles.activeChip]}
                  onPress={() => setExperience(exp)}
                >
                  <Text style={[styles.chipText, experience === exp && styles.activeChipText]}>{exp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 15 }]}>Equipment Available</Text>
            {equipments.map((eq) => (
              <TouchableOpacity
                key={eq.title}
                style={[styles.activitySelectionCard, equipment === eq.title && styles.activeGoalCard]}
                onPress={() => setEquipment(eq.title)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalCardTitle, equipment === eq.title && { color: colors.background }]}>{eq.title}</Text>
                  <Text style={[styles.goalCardDesc, equipment === eq.title && { color: 'rgba(0,0,0,0.6)' }]}>{eq.desc}</Text>
                </View>
                {equipment === eq.title && <Ionicons name="checkmark-circle" size={24} color={colors.background} />}
              </TouchableOpacity>
            ))}

            {/* Dynamic Women Cycle Sync Module */}
            {gender === 'Female' ? (
              <View style={styles.femaleSyncCard}>
                <View style={styles.femaleCardHeader}>
                  <Ionicons name="flower" size={24} color="#E91E63" />
                  <Text style={styles.femaleCardTitle}>Cycle-Adaptive Workouts</Text>
                  <TouchableOpacity onPress={() => setSyncCycle(!syncCycle)} style={styles.toggleBtn}>
                    <Ionicons name={syncCycle ? "toggle" : "toggle-outline"} size={40} color={syncCycle ? "#E91E63" : colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                {syncCycle && (
                  <View style={styles.femaleDetails}>
                    <Text style={styles.cycleLabelText}>Cycle Length (days)</Text>
                    <TextInput style={styles.femaleInput} keyboardType="numeric" value={cycleLength} onChangeText={setCycleLength} />

                    <Text style={[styles.cycleLabelText, { marginTop: 10 }]}>How many days ago did your last period start?</Text>
                    <View style={styles.numInputBox}>
                      <TouchableOpacity onPress={() => setDaysAgoPeriodStarted(String(Math.max(0, parseInt(daysAgoPeriodStarted) - 1)))} style={styles.numBtn}>
                        <Ionicons name="remove" size={18} color="#FFF" />
                      </TouchableOpacity>
                      <TextInput style={styles.numInput} keyboardType="numeric" value={daysAgoPeriodStarted} onChangeText={setDaysAgoPeriodStarted} />
                      <TouchableOpacity onPress={() => setDaysAgoPeriodStarted(String(Math.min(35, parseInt(daysAgoPeriodStarted) + 1)))} style={styles.numBtn}>
                        <Ionicons name="add" size={18} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cycleNotice}>Workouts automatically adjust sets and intensities to minimize stress during Menstrual and Luteal phases!</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.maleNoticeCard}>
                <Ionicons name="barbell-outline" size={22} color={colors.primary} />
                <Text style={styles.maleNoticeText}>
                  Menstrual tracking is disabled for male accounts. Your training splits and readiness metrics are optimized for direct progressive overload.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button Navigation Footer */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>{step === 4 ? 'Complete & Launch BurnX' : 'Continue'}</Text>
            <Ionicons name={step === 4 ? "rocket-outline" : "arrow-forward"} size={20} color="#FFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: ui.spacing.l, paddingBottom: ui.spacing.xxl, flexGrow: 1, maxWidth: 520, width: '100%', alignSelf: 'center' },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: ui.spacing.m, marginBottom: ui.spacing.s },
  backBtn: { padding: ui.spacing.xs },
  headerTitle: { ...typography.headline },
  stepIndicator: { ...typography.headline, color: colors.primary },
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
  
  switchAuthBtn: { marginTop: 15, alignItems: 'center', padding: 10 },
  switchAuthText: { color: colors.textSecondary, fontSize: 14 },

  chipRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: ui.spacing.l },
  genderChip: { flex: 1, backgroundColor: colors.surfaceSecondary, paddingVertical: ui.spacing.m, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginHorizontal: ui.spacing.xs },
  activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.subhead, color: colors.textSecondary },
  activeChipText: { color: '#FFF', fontWeight: 'bold' },

  dobRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 15 },
  dobBox: { flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  dobSubLabel: { fontSize: 9, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 2 },
  dobInput: { color: colors.textPrimary, fontWeight: 'bold', fontSize: 15, textAlign: 'center', width: '100%' },
  computedAgeBox: { width: 54, height: 50, backgroundColor: colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  computedAgeVal: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  computedAgeLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 8, fontWeight: 'bold' },

  inputsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: ui.spacing.s, marginBottom: ui.spacing.m },
  gridInputBox: { width: '48%' },
  numInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, padding: ui.spacing.xs, height: ui.inputHeight },
  numBtn: { backgroundColor: colors.surface, width: 40, height: 40, borderRadius: ui.borderRadiusSm, justifyContent: 'center', alignItems: 'center', ...ui.shadowSm },
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
