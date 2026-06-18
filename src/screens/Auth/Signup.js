import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';
import { supabase } from '../../services/supabase';

const { width } = Dimensions.get('window');

export default function Signup({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const completeOnboarding = useStore((state) => state.completeOnboarding);
  const bypassAuth = useStore((state) => state.bypassAuth);
  
  const [step, setStep] = useState(1);
  
  // Onboarding Profile State
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
        setName('FitAxis Athlete');
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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: profileData
        }
      });

      if (error) throw error;
      
      // Also complete local onboarding
      completeOnboarding({ ...profileData, email: email.trim() });
    } catch (error) {
      alert(error.message);
    }
  };

  const triggerQuickDemo = () => {
    bypassAuth('member');
  };

  return (
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
              <Text style={styles.titleText}>Welcome to <Text style={{ color: colors.primary }}>FITAXIS</Text></Text>
              <Text style={styles.subtitleText}>Let's set up your personalized fitness & nutrition axis.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>What should we call you?</Text>
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

            {/* Quick Demo Bypass */}
            <TouchableOpacity style={styles.demoCard} onPress={triggerQuickDemo}>
              <Ionicons name="sparkles" size={24} color={colors.primary} />
              <View style={styles.demoCardTextCol}>
                <Text style={styles.demoCardTitle}>Fast Track (Demo Mode)</Text>
                <Text style={styles.demoCardDesc}>Instantly bypass onboarding and populate with rich test data.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
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
              <Text style={styles.titleText}>Choose your <Text style={{ color: colors.primary }}>Axis Goal</Text></Text>
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
              <Text style={styles.titleText}>Tailor your <Text style={{ color: colors.primary }}>Axis Preferences</Text></Text>
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
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
            <Text style={styles.primaryBtnText}>{step === 4 ? 'Launch FitAxis' : 'Continue'}</Text>
            <Ionicons name={step === 4 ? "rocket-outline" : "arrow-forward"} size={20} color="#FFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 60, flexGrow: 1 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Platform.OS === 'ios' ? 40 : 15, marginBottom: 10 },
  backBtn: { padding: 5 },
  headerTitle: { ...typography.title, fontWeight: 'bold' },
  stepIndicator: { ...typography.caption, color: colors.primary, fontWeight: 'bold' },
  progressBarBg: { width: '100%', height: 4, backgroundColor: colors.border, borderRadius: 2, marginBottom: 25 },
  progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  
  stepWrapper: { flex: 1 },
  titleArea: { marginBottom: 25 },
  titleText: { ...typography.header, fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  subtitleText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: ui.borderRadius, ...ui.shadow, borderWidth: 1, borderColor: colors.border },
  cardLabel: { ...typography.caption, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: colors.textPrimary, paddingVertical: 14, fontSize: 16 },
  
  demoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 20, borderRadius: ui.borderRadius, marginTop: 25, borderWidth: 1, borderColor: colors.primary, ...ui.shadow },
  demoCardTextCol: { flex: 1, paddingHorizontal: 15 },
  demoCardTitle: { ...typography.body, fontWeight: 'bold', color: colors.primary },
  demoCardDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  chipRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  genderChip: { flex: 1, backgroundColor: colors.background, paddingVertical: 12, borderRadius: 12, borderHeight: 1, borderColor: colors.border, borderWidth: 1, alignItems: 'center', marginHorizontal: 4 },
  activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '600' },
  activeChipText: { color: colors.textPrimary, fontWeight: 'bold' },

  inputsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 15 },
  gridInputBox: { width: '48%' },
  numInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 4 },
  numBtn: { backgroundColor: colors.surface, width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  numInput: { flex: 1, color: colors.textPrimary, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },

  sectionLabel: { ...typography.title, fontSize: 18, marginBottom: 12 },
  goalSelectionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 15, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  activeGoalCard: { backgroundColor: colors.primary, borderColor: colors.primary },
  iconFrame: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  goalTextFrame: { flex: 1 },
  goalCardTitle: { ...typography.body, fontWeight: 'bold' },
  goalCardDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  activitySelectionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 15, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border },

  femaleSyncCard: { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#E91E63', padding: 20, borderRadius: ui.borderRadius, marginTop: 20, ...ui.shadow },
  femaleCardHeader: { flexDirection: 'row', alignItems: 'center' },
  femaleCardTitle: { ...typography.body, fontWeight: 'bold', color: '#E91E63', flex: 1, marginLeft: 10 },
  toggleBtn: { padding: 4 },
  femaleDetails: { marginTop: 15 },
  cycleLabelText: { ...typography.caption, color: colors.textSecondary, marginBottom: 5 },
  femaleInput: { backgroundColor: colors.background, color: colors.textPrimary, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, fontSize: 16, fontWeight: 'bold', width: 80, textAlign: 'center', marginBottom: 10 },
  cycleNotice: { ...typography.caption, color: '#E91E63', fontStyle: 'italic', marginTop: 10, lineHeight: 16 },

  footerRow: { marginTop: 30, alignItems: 'center' },
  primaryBtn: { backgroundColor: colors.primary, width: '100%', paddingVertical: 16, borderRadius: ui.borderRadius, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', ...ui.shadow },
  primaryBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
