import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
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
  const [age, setAge] = useState('25');
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
  const [daysAgoPeriodStarted, setDaysAgoPeriodStarted] = useState('10'); // default 10 days ago (Follicular phase)

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

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setName('BurnX Athlete');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        alert('Please enter a valid email address.');
        return;
      }

      if (!password.trim() || password.length < 6) {
        alert('Please enter a password with at least 6 characters.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
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
    // Calculate last period date string based on days ago selected
    let lastPeriodStr = null;
    if (gender === 'Female' && syncCycle) {
      const today = new Date();
      const daysAgo = parseInt(daysAgoPeriodStarted) || 0;
      today.setDate(today.getDate() - daysAgo);
      lastPeriodStr = today.toISOString().split('T')[0];
    }

    const profileData = {
      name: name.trim() || 'Athlete',
      role: role || 'client',
      age: parseInt(age) || 25,
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
      if (supabase && supabase.auth) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: profileData
          }
        });

        if (error) {
          console.warn('Supabase auth signup notice:', error.message);
        }
      }
    } catch (error) {
      console.warn('Supabase offline or unreachable:', error.message);
    } finally {
      // Always complete local onboarding seamlessly so user is never blocked by database errors
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
              <View style={{ width: 24 }} />
            )}
            <Text style={styles.headerTitle}>Onboarding</Text>
            <Text style={styles.stepIndicator}>{step}/4</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
          </View>

        {/* STEP 1: WELCOME & DETAILS */}
        {step === 1 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Welcome to <Text style={{ color: colors.primary }}>BURNX</Text></Text>
              <Text style={styles.subtitleText}>Let's set up your personalized training plan.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Select Account Role</Text>
              <View style={styles.chipRow}>
                {[
                  { id: 'client', label: 'Client' },
                  { id: 'trainer', label: 'Trainer' },
                  { id: 'admin', label: 'Admin' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.genderChip, role === r.id && styles.activeChip]}
                    onPress={() => setRole(r.id)}
                  >
                    <Text style={[styles.chipText, role === r.id && styles.activeChipText]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.cardLabel, { marginTop: 10 }]}>What should we call you?</Text>
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

              <Text style={[styles.cardLabel, { marginTop: 20 }]}>Your Email</Text>
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

              <Text style={[styles.cardLabel, { marginTop: 20 }]}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Create a secure password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 2: DEMOGRAPHICS */}
        {step === 2 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Tell us about <Text style={{ color: colors.primary }}>yourself</Text></Text>
              <Text style={styles.subtitleText}>Your metabolic calculators adapt to these parameters.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Biological Gender</Text>
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

              <View style={styles.inputsGrid}>
                <View style={styles.gridInputBox}>
                  <Text style={styles.cardLabel}>Age</Text>
                  <View style={styles.numInputBox}>
                    <TouchableOpacity onPress={() => setAge(String(Math.max(12, parseInt(age) - 1)))} style={styles.numBtn}>
                      <Ionicons name="remove" size={18} color="#FFF" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.numInput}
                      keyboardType="numeric"
                      value={age}
                      onChangeText={setAge}
                    />
                    <TouchableOpacity onPress={() => setAge(String(Math.min(99, parseInt(age) + 1)))} style={styles.numBtn}>
                      <Ionicons name="add" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.gridInputBox}>
                  <Text style={styles.cardLabel}>Height (cm)</Text>
                  <View style={styles.numInputBox}>
                    <TouchableOpacity onPress={() => setHeight(String(Math.max(100, parseInt(height) - 1)))} style={styles.numBtn}>
                      <Ionicons name="remove" size={18} color="#FFF" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.numInput}
                      keyboardType="numeric"
                      value={height}
                      onChangeText={setHeight}
                    />
                    <TouchableOpacity onPress={() => setHeight(String(Math.min(250, parseInt(height) + 1)))} style={styles.numBtn}>
                      <Ionicons name="add" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Text style={[styles.cardLabel, { marginTop: 15 }]}>Weight (kg)</Text>
              <View style={styles.numInputBox}>
                <TouchableOpacity onPress={() => setWeight(String(Math.max(30, parseFloat(weight) - 0.5)))} style={styles.numBtn}>
                  <Ionicons name="remove" size={18} color="#FFF" />
                </TouchableOpacity>
                <TextInput
                  style={styles.numInput}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
                <TouchableOpacity onPress={() => setWeight(String(Math.min(200, parseFloat(weight) + 0.5)))} style={styles.numBtn}>
                  <Ionicons name="add" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: FITNESS GOALS */}
        {step === 3 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Choose your <Text style={{ color: colors.primary }}>Training Goal</Text></Text>
              <Text style={styles.subtitleText}>We tailor your training volume and macronutrient targets.</Text>
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

        {/* STEP 4: PREFERENCES & CYCLE SYNC */}
        {step === 4 && (
          <View style={styles.stepWrapper}>
            <View style={styles.titleArea}>
              <Text style={styles.titleText}>Tailor your <Text style={{ color: colors.primary }}>Training Preferences</Text></Text>
              <Text style={styles.subtitleText}>Refining your environment, equipment availability, and hormonal biological clocks.</Text>
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
            {gender === 'Female' && (
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
                    <TextInput
                      style={styles.femaleInput}
                      keyboardType="numeric"
                      value={cycleLength}
                      onChangeText={setCycleLength}
                    />

                    <Text style={[styles.cycleLabelText, { marginTop: 10 }]}>How many days ago did your last cycle start?</Text>
                    <View style={styles.numInputBox}>
                      <TouchableOpacity onPress={() => setDaysAgoPeriodStarted(String(Math.max(0, parseInt(daysAgoPeriodStarted) - 1)))} style={styles.numBtn}>
                        <Ionicons name="remove" size={18} color="#FFF" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.numInput}
                        keyboardType="numeric"
                        value={daysAgoPeriodStarted}
                        onChangeText={setDaysAgoPeriodStarted}
                      />
                      <TouchableOpacity onPress={() => setDaysAgoPeriodStarted(String(Math.min(35, parseInt(daysAgoPeriodStarted) + 1)))} style={styles.numBtn}>
                        <Ionicons name="add" size={18} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cycleNotice}>Workouts automatically adjust sets and intensities to minimize stress during Menstrual and Luteal phases!</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Action Button Navigation Footer */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>{step === 4 ? 'Launch BurnX' : 'Continue'}</Text>
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
  scrollContent: { paddingHorizontal: ui.spacing.l, paddingBottom: ui.spacing.xxl, flexGrow: 1 },
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
  
  card: { backgroundColor: colors.surface, padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, ...ui.shadow, borderWidth: 1, borderColor: colors.border },
  cardLabel: { ...typography.subhead, fontWeight: '600', color: colors.primary, marginBottom: ui.spacing.s },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, borderRadius: ui.borderRadiusSm, paddingHorizontal: ui.spacing.m, height: ui.inputHeight, borderWidth: 1, borderColor: 'transparent' },
  inputIcon: { marginRight: ui.spacing.s },
  textInput: { flex: 1, color: colors.textPrimary, fontSize: typography.body.fontSize, height: '100%' },
  
  chipRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: ui.spacing.l },
  genderChip: { flex: 1, backgroundColor: colors.surfaceSecondary, paddingVertical: ui.spacing.m, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginHorizontal: ui.spacing.xs },
  activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.subhead, color: colors.textSecondary },
  activeChipText: { color: '#FFF', fontWeight: 'bold' },

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

  footerRow: { marginTop: ui.spacing.xl, alignItems: 'center' },
  primaryBtn: { backgroundColor: colors.primary, width: '100%', height: ui.buttonHeight, borderRadius: ui.borderRadius, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', ...ui.shadow },
  primaryBtnText: { ...typography.headline, color: '#FFFFFF' }
});
