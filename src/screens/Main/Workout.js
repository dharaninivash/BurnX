import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert, Animated, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';
import BurnX3DFitnessWidget from '../../components/3d/BurnX3DFitnessWidget';
import AppleCard from '../../components/ui/AppleCard';

import { MASTER_EXERCISES } from '../../data/workouts';

function getSeededRandom(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function() {
    let t = (hash += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Workout({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const user = useStore((state) => state.user) || { gender: 'Male', experience: 'Intermediate', equipment: 'Full Gym' };
  const lastPeriodDate = useStore((state) => state.lastPeriodDate);
  const cycleLength = useStore((state) => state.cycleLength) || 28;
  const currentMood = useStore((state) => state.currentMood) || 'Calm';
  const readinessScore = useStore((state) => state.readinessScore) || 80;
  const completeWorkout = useStore((state) => state.completeWorkout);
  const workoutLogs = useStore((state) => state.workoutLogs) || [];
  const deleteWorkoutLog = useStore((state) => state.deleteWorkoutLog);

  const dailyWorkout = useStore((state) => state.dailyWorkout);
  const setDailyWorkout = useStore((state) => state.setDailyWorkout);
  const toggleDailyExerciseCompletionStore = useStore((state) => state.toggleDailyExerciseCompletion);

  const splits = ['Full Body', 'Push Pull Legs', 'Upper / Lower', 'Arnold Split'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const defaultDay = daysOfWeek.includes(todayDayName) ? todayDayName : 'Monday';

  const [selectedSplit, setSelectedSplit] = useState(dailyWorkout?.split || 'Full Body');
  const [selectedDay, setSelectedDay] = useState(dailyWorkout?.day || defaultDay);
  const [generatedExercises, setGeneratedExercises] = useState(dailyWorkout?.exercises || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Set Logger State
  const [logWeight, setLogWeight] = useState('');
  const [logReps, setLogReps] = useState('');
  const logExerciseSet = useStore((state) => state.logExerciseSet);

  // SVG Animated Visualizer state
  const [animationVal] = useState(new Animated.Value(0));

  // Menstrual cycle checks for deload
  let isMenstruating = false;
  if (user?.gender === 'Female' && lastPeriodDate) {
    const lastDate = new Date(lastPeriodDate);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
    const cycleDay = diffDays % cycleLength;
    // Day 0 to 5 is Menstruation
    isMenstruating = cycleDay >= 0 && cycleDay <= 5;
  }

  // Trigger exercise generator
  const generateWorkout = async () => {
    // Check if static workout for today already exists in store
    if (
      dailyWorkout &&
      dailyWorkout.date === todayStr &&
      dailyWorkout.split === selectedSplit &&
      dailyWorkout.day === selectedDay &&
      Array.isArray(dailyWorkout.exercises) &&
      dailyWorkout.exercises.length > 0
    ) {
      setGeneratedExercises(dailyWorkout.exercises);
      return;
    }

    setIsGenerating(true);
    
    if (isMenstruating) {
      // FEMALE MENSTRUAL PERIOD DELOAD AUTO-OVERRIDE
      const finalSet = [
        { name: 'Restorative Child\'s Pose Stretch', reps: '60s hold', sets: '3', muscle: 'Recovery', equipment: 'Bodyweight Only', instructions: 'Kneel on floor, touch big toes, sit on heels. Fold forward extending arms.', mistakes: 'Holding breath, tensing neck.', isCompleted: false },
        { name: 'Cat-Cow Flow', reps: '12 reps', sets: '3', muscle: 'Recovery', equipment: 'Bodyweight Only', instructions: 'In all-fours position, arch back up (Cat) and curve down (Cow) gently.', mistakes: 'Hyperextending neck, moving too fast.', isCompleted: false },
        { name: 'Gentle Bodyweight Squats', reps: '8-10 reps', sets: '3', muscle: 'Legs', equipment: 'Bodyweight Only', instructions: 'Slow squatting movements with focus on breathing and core relaxation.', mistakes: 'Too deep knee compression.', isCompleted: false },
        { name: 'Glute Bridge Hold', reps: '10 reps (3s hold)', sets: '3', muscle: 'Core', equipment: 'Bodyweight Only', instructions: 'Lie on back, feet flat. Raise hips to sky squeezing glutes, hold 3 seconds.', mistakes: 'Over-arching lower back.', isCompleted: false }
      ];
      setGeneratedExercises(finalSet);
      if (setDailyWorkout) {
        setDailyWorkout({ date: todayStr, split: selectedSplit, day: selectedDay, exercises: finalSet });
      }
      setIsGenerating(false);
      return;
    }

    try {
      // Determine target categories based on selected split and day
      let targetCategories = [];
      if (selectedSplit === 'Full Body') {
        if (['Monday', 'Wednesday', 'Friday'].includes(selectedDay)) {
          targetCategories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Abs & Core'];
        }
      } else if (selectedSplit === 'Push Pull Legs') {
        if (['Monday', 'Thursday'].includes(selectedDay)) targetCategories = ['Chest', 'Shoulders', 'Triceps', 'Abs & Core'];
        else if (['Tuesday', 'Friday'].includes(selectedDay)) targetCategories = ['Back', 'Biceps', 'Forearms'];
        else if (['Wednesday', 'Saturday'].includes(selectedDay)) targetCategories = ['Legs', 'Calves', 'Tibialis'];
      } else if (selectedSplit === 'Upper / Lower') {
        if (['Monday', 'Thursday'].includes(selectedDay)) targetCategories = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'];
        else if (['Tuesday', 'Friday'].includes(selectedDay)) targetCategories = ['Legs', 'Calves', 'Tibialis', 'Abs & Core'];
      } else { // Arnold Split
        if (['Monday', 'Thursday'].includes(selectedDay)) targetCategories = ['Chest', 'Back'];
        else if (['Tuesday', 'Friday'].includes(selectedDay)) targetCategories = ['Shoulders', 'Triceps', 'Biceps'];
        else if (['Wednesday', 'Saturday'].includes(selectedDay)) targetCategories = ['Legs', 'Calves', 'Abs & Core'];
      }

      if (targetCategories.length === 0) {
        setGeneratedExercises([]);
        if (setDailyWorkout) {
          setDailyWorkout({ date: todayStr, split: selectedSplit, day: selectedDay, exercises: [] });
        }
        setIsGenerating(false);
        return;
      }

      // Seeded deterministic workout selector for static daily consistency
      const seedStr = `${todayStr}_${selectedSplit}_${selectedDay}_${user?.id || 'athlete'}`;
      const rng = getSeededRandom(seedStr);

      let finalSet = [];
      
      // Determine if we need to scale back intensity (CNS/Mood deload)
      const needsDeload = readinessScore < 50 || ['Tired', 'Anxious', 'Sad'].includes(currentMood);
      const targetSets = needsDeload ? '3' : '4';
      const targetReps = needsDeload ? '8-10' : '8-12';

      for (const category of targetCategories) {
        let available = MASTER_EXERCISES.filter(ex => ex.category === category);
        
        if (needsDeload) {
           const easier = available.filter(ex => ex.beginner);
           if (easier.length > 0) available = easier;
        }

        if (available.length > 0) {
          // Deterministic shuffle based on daily seed
          const shuffled = [...available].sort(() => 0.5 - rng());
          // Pick 1-2 exercises per category
          const selected = shuffled.slice(0, category === 'Abs & Core' || category === 'Calves' ? 1 : 2).map(ex => ({
            ...ex,
            instructions: 'Focus on proper form and controlled negatives. 1 second concentric, 2 seconds eccentric.',
            sets: targetSets,
            reps: targetReps,
            isCompleted: false
          }));
          finalSet = [...finalSet, ...selected];
        }
      }

      setGeneratedExercises(finalSet);
      if (setDailyWorkout) {
        setDailyWorkout({ date: todayStr, split: selectedSplit, day: selectedDay, exercises: finalSet });
      }
    } catch (error) {
      console.error('Generation Error:', error);
      const fallbackSet = MASTER_EXERCISES.slice(0, 4).map(ex => ({...ex, sets: '3', reps: '10', isCompleted: false}));
      setGeneratedExercises(fallbackSet);
    }

    setIsGenerating(false);
  };

  useEffect(() => {
    generateWorkout();
  }, [selectedSplit, selectedDay, user?.gender, user?.experience, user?.equipment, readinessScore, currentMood]);

  // Keep generated exercises updated when store dailyWorkout updates from live sync
  useEffect(() => {
    if (
      dailyWorkout &&
      dailyWorkout.date === todayStr &&
      dailyWorkout.split === selectedSplit &&
      dailyWorkout.day === selectedDay &&
      Array.isArray(dailyWorkout.exercises)
    ) {
      setGeneratedExercises(dailyWorkout.exercises);
    }
  }, [dailyWorkout]);

  const openExerciseModal = (exercise) => {
    setSelectedExercise(exercise);
    setLogWeight('');
    setLogReps('');
    setModalVisible(true);
    
    // Start CSS visualizer looping animation
    animationVal.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationVal, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(animationVal, { toValue: 0, duration: 1500, useNativeDriver: false })
      ])
    ).start();
  };

  const toggleExerciseCompletion = (idx) => {
    const updated = [...generatedExercises];
    updated[idx].isCompleted = !updated[idx].isCompleted;
    setGeneratedExercises(updated);
    if (toggleDailyExerciseCompletionStore) {
      toggleDailyExerciseCompletionStore(idx);
    }
  };

  const handleLoggedWorkout = () => {
    Alert.alert(
      'Log Workout Splits',
      `Complete and save the active "${selectedSplit}" workout session offline?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            completeWorkout(
              isMenstruating ? 'Restorative Wellness Deload' : `Active ${selectedSplit}`,
              selectedSplit,
              45, // mins
              generatedExercises.length
            );
            Alert.alert('Success', 'Workout logged! Streak increased 🔥');
          }
        }
      ]
    );
  };

  const handleLogSet = () => {
    if (!logWeight || !logReps) {
      Alert.alert('Error', 'Please enter both weight and reps.');
      return;
    }
    logExerciseSet(selectedExercise.name, selectedExercise.muscle, logWeight, logReps);
    Alert.alert('Success', `Logged ${logWeight}kg x ${logReps} reps for ${selectedExercise.name}`);
    setLogWeight('');
    setLogReps('');
  };

  // Animated style for vector visualizer contraction
  const contractionHeight = animationVal.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 40] // Simulating concentric muscle contraction squeeze
  });

  const contractionOpacity = animationVal.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1.0]
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
            <BurnX3DFitnessWidget type="dumbbell" width={48} height={48} />
            <View>
              <Text style={styles.headerTitle}>BURNX</Text>
              <Text style={styles.headerSub}>Dynamic Workout Plan Engine</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.timerIconBtn} 
            onPress={() => navigation.navigate('WorkoutTimer')}
          >
            <Ionicons name="timer-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Dynamic Period Adaptive Alert */}
        {isMenstruating && (
          <View style={styles.periodAlertCard}>
            <Ionicons name="flower" size={22} color="#FFF" />
            <View style={styles.periodAlertTextCol}>
              <Text style={styles.periodAlertTitle}>Cycle Sync Override Active</Text>
              <Text style={styles.periodAlertDesc}>Menstrual Phase detected. Workout generator has auto-loaded a soothing deload routine to protect recovery indices.</Text>
            </View>
          </View>
        )}

        {/* Dynamic CNS / Mood Adaptive Alert */}
        {!isMenstruating && (readinessScore < 50 || ['Tired', 'Anxious', 'Sad'].includes(currentMood)) && (
          <View style={[styles.periodAlertCard, { backgroundColor: colors.error }]}>
            <Ionicons name="battery-dead-outline" size={22} color="#FFF" />
            <View style={styles.periodAlertTextCol}>
              <Text style={styles.periodAlertTitle}>CNS Deload Active</Text>
              <Text style={styles.periodAlertDesc}>We detected low readiness or high fatigue. Workout intensity and volume have been lowered to protect your nervous system today.</Text>
            </View>
          </View>
        )}

        {/* Splits Selector */}
        {!isMenstruating && (
          <View style={styles.splitsContainer}>
            <Text style={styles.sectionTitle}>Select Gym Split</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.splitScroll}>
              {splits.map((split) => (
                <TouchableOpacity 
                  key={split} 
                  style={[styles.splitCard, selectedSplit === split && styles.splitCardActive]}
                  onPress={() => setSelectedSplit(split)}
                >
                  <Text style={[styles.splitName, selectedSplit === split && { color: colors.background }]}>
                    {split}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Select Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.splitScroll}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.splitCard, selectedDay === day && styles.splitCardActive]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.splitName, selectedDay === day && { color: colors.background }]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Exercise List */}
        <View style={styles.exerciseSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {isMenstruating ? 'Restorative Recovery Routine' : `${selectedSplit} - ${selectedDay}`}
            </Text>
            <Text style={styles.exercisesCountTag}>{generatedExercises.length} Exercises</Text>
          </View>

          {isGenerating ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : generatedExercises.length === 0 ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <Ionicons name="bed-outline" size={48} color={colors.primary} style={{ marginBottom: 15 }} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 }}>Rest Day</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>Active recovery and rest are crucial for muscle growth. Take it easy today!</Text>
            </View>
          ) : (
            <View style={styles.exerciseList}>
              {generatedExercises.map((ex, idx) => (
                <View key={idx} style={[styles.exerciseCard, ex.isCompleted && styles.exerciseCardCompleted]}>
                  <TouchableOpacity onPress={() => toggleExerciseCompletion(idx)} style={styles.checkIcon}>
                    <Ionicons name={ex.isCompleted ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={ex.isCompleted ? colors.success : colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.exerciseCardContent} onPress={() => openExerciseModal(ex)}>
                    <View style={[styles.exerciseIcon, ex.isCompleted && { backgroundColor: colors.success }]}>
                      <Ionicons name={ex.muscle === 'Recovery' ? 'flower' : 'barbell'} size={22} color="#FFF" />
                    </View>
                    <View style={styles.exerciseDetails}>
                      <Text style={[styles.exerciseName, ex.isCompleted && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>{ex.name}</Text>
                      <Text style={styles.exerciseInfo}>{ex.sets} Sets • {ex.reps} • <Text style={{ color: ex.isCompleted ? colors.textSecondary : colors.primary }}>{ex.muscle}</Text></Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Complete Workout button */}
        {!isGenerating && generatedExercises.length > 0 && (
          <TouchableOpacity style={styles.completeWorkoutBtn} onPress={handleLoggedWorkout}>
            <Ionicons name="checkmark-done" size={24} color="#FFF" />
            <Text style={styles.completeWorkoutBtnText}>Complete Session</Text>
          </TouchableOpacity>
        )}

        {/* SAVED WORKOUT HISTORY & DETAILED LOGS */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeaderRow}>
            <Ionicons name="journal-outline" size={20} color={colors.primary} />
            <Text style={styles.historyTitle}>Saved Workout History & Logs</Text>
          </View>

          {workoutLogs.length === 0 ? (
            <View style={styles.emptyHistoryBox}>
              <Ionicons name="barbell-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyHistoryText}>No sets logged yet. Tap an exercise above to log your weight, reps, date & time!</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {workoutLogs.map((log) => (
                <View key={log.id} style={styles.historyCard}>
                  <View style={styles.historyMainCol}>
                    <Text style={styles.historyExerciseName}>{log.exerciseName}</Text>
                    <View style={styles.historyMetaRow}>
                      <Text style={styles.historyTag}>{log.muscle}</Text>
                      <Text style={styles.historyDateTime}>• {log.date} at {log.time || '10:00 AM'}</Text>
                    </View>
                  </View>

                  <View style={styles.historyRightCol}>
                    <Text style={styles.historyWeightText}>{log.weight} kg × {log.reps} reps</Text>
                    <TouchableOpacity onPress={() => deleteWorkoutLog(log.id)} style={{ padding: 4, marginLeft: 8 }}>
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick User preference indicators */}
        <View style={styles.prefIndicators}>
          <Text style={styles.prefTitle}>Your Profile Baseline</Text>
          <View style={styles.prefGrid}>
            <View style={styles.prefTag}>
              <Ionicons name="flash-outline" size={14} color={colors.primary} />
              <Text style={styles.prefTagText}>{user?.experience}</Text>
            </View>
            <View style={styles.prefTag}>
              <Ionicons name="construct-outline" size={14} color={colors.primary} />
              <Text style={styles.prefTagText}>{user?.equipment}</Text>
            </View>
            <View style={styles.prefTag}>
              <Ionicons name="trophy-outline" size={14} color={colors.primary} />
              <Text style={styles.prefTagText}>{user?.goal}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* EXERCISE DETAIL & ANTIMATION MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedExercise && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                    <Text style={styles.modalSub}>{selectedExercise.sets} sets x {selectedExercise.reps}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={28} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1, marginBottom: 20 }} showsVerticalScrollIndicator={false}>
                  {/* EXERCISE GIF / VISUALIZER */}
                  <View style={styles.gifContainer}>
                    <Image 
                      source={{ uri: selectedExercise.gifUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop' }} 
                      style={styles.exerciseGif} 
                      resizeMode="cover" 
                    />
                  </View>

                  {/* Muscle Stats */}
                  <View style={styles.modalStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Target Muscle</Text>
                      <Text style={styles.statValue}>{selectedExercise.muscle}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Equipment</Text>
                      <Text style={styles.statValue}>{selectedExercise.equipment || 'Bodyweight'}</Text>
                    </View>
                  </View>

                  <Text style={styles.infoTitle}>Step-by-Step Instructions</Text>
                  <Text style={styles.infoText}>{selectedExercise.instructions}</Text>

                  {selectedExercise.mistakes ? (
                    <>
                      <Text style={[styles.infoTitle, { color: colors.error }]}>Avoid Common Mistakes</Text>
                      <Text style={[styles.infoText, { color: colors.textSecondary }]}>{selectedExercise.mistakes}</Text>
                    </>
                  ) : null}

                  {/* QUICK SET LOGGER */}
                  <View style={styles.loggerCard}>
                    <Text style={styles.infoTitle}>Log a Set</Text>
                    <View style={styles.loggerRow}>
                      <View style={styles.loggerInputBox}>
                        <Text style={styles.loggerLabel}>Weight (kg)</Text>
                        <TextInput style={styles.loggerInput} keyboardType="numeric" value={logWeight} onChangeText={setLogWeight} placeholder="e.g. 20" placeholderTextColor={colors.border} />
                      </View>
                      <View style={styles.loggerInputBox}>
                        <Text style={styles.loggerLabel}>Reps</Text>
                        <TextInput style={styles.loggerInput} keyboardType="numeric" value={logReps} onChangeText={setLogReps} placeholder="e.g. 10" placeholderTextColor={colors.border} />
                      </View>
                      <TouchableOpacity style={styles.logSetBtn} onPress={handleLogSet}>
                        <Ionicons name="add" size={20} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                </ScrollView>

                <TouchableOpacity 
                  style={styles.startBtn} 
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('WorkoutTimer');
                  }}
                >
                  <Ionicons name="timer" size={22} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.startBtnText}>Start Workout</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: ui.spacing.m, paddingBottom: ui.spacing.xxl },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.l, paddingTop: ui.spacing.s },
  headerTitle: { ...typography.largeTitle, color: colors.primary, letterSpacing: 1 },
  headerSub: { ...typography.subhead, color: colors.textSecondary, marginTop: 2 },
  timerIconBtn: { padding: ui.spacing.s, backgroundColor: colors.surfaceSecondary, borderRadius: 24, borderWidth: 1, borderColor: colors.border },

  periodAlertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E91E63', borderRadius: ui.borderRadiusLg, padding: ui.spacing.l, marginBottom: ui.spacing.l, ...ui.shadowLg },
  periodAlertTextCol: { flex: 1, marginLeft: ui.spacing.m },
  periodAlertTitle: { ...typography.headline, color: colors.textPrimary },
  periodAlertDesc: { ...typography.footnote, color: colors.textPrimary, opacity: 0.9, marginTop: 6, lineHeight: 18 },

  splitsContainer: { marginBottom: ui.spacing.l },
  sectionTitle: { ...typography.headline, marginBottom: ui.spacing.s },
  splitScroll: { flexDirection: 'row' },
  splitCard: { backgroundColor: colors.surface, paddingHorizontal: ui.spacing.l, paddingVertical: ui.spacing.m, borderRadius: ui.borderRadiusLg, marginRight: ui.spacing.m, borderWidth: 1, borderColor: colors.border },
  splitCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  splitName: { ...typography.subhead, fontWeight: '700', color: colors.textPrimary },

  exerciseSection: { marginBottom: ui.spacing.xl },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.m },
  exercisesCountTag: { ...typography.caption, color: colors.primary, fontWeight: '700', backgroundColor: 'rgba(255, 122, 0, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  exerciseList: { gap: ui.spacing.m },
  
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, ...ui.shadowSm },
  exerciseCardCompleted: { opacity: 0.7, borderColor: colors.success },
  checkIcon: { marginRight: ui.spacing.m },
  exerciseCardContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  exerciseIcon: { backgroundColor: colors.primary, width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: ui.spacing.m },
  exerciseDetails: { flex: 1 },
  exerciseName: { ...typography.headline, color: colors.textPrimary },
  exerciseInfo: { ...typography.caption, marginTop: 4 },

  completeWorkoutBtn: { flexDirection: 'row', backgroundColor: colors.primary, height: ui.buttonHeight, borderRadius: ui.borderRadius, justifyContent: 'center', alignItems: 'center', ...ui.shadow, marginBottom: ui.spacing.xl },
  completeWorkoutBtnText: { ...typography.headline, color: '#FFF', marginLeft: 8 },

  prefIndicators: { backgroundColor: colors.surface, padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border },
  prefTitle: { ...typography.caption, color: colors.textSecondary, marginBottom: ui.spacing.m, textTransform: 'uppercase', letterSpacing: 1 },
  prefGrid: { flexDirection: 'row', gap: ui.spacing.m },
  prefTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  prefTagText: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },

  historyContainer: { backgroundColor: colors.surface, padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, marginBottom: ui.spacing.xl },
  historyHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: ui.spacing.m },
  historyTitle: { ...typography.headline, color: colors.textPrimary, marginLeft: 8 },
  emptyHistoryBox: { alignItems: 'center', paddingVertical: 20 },
  emptyHistoryText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 18 },
  historyList: { gap: 10 },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  historyMainCol: { flex: 1 },
  historyExerciseName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  historyMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  historyTag: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  historyDateTime: { color: colors.textSecondary, fontSize: 11, marginLeft: 4 },
  historyRightCol: { flexDirection: 'row', alignItems: 'center' },
  historyWeightText: { color: colors.textPrimary, fontSize: 13, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, padding: ui.spacing.l, borderTopLeftRadius: ui.borderRadiusLg, borderTopRightRadius: ui.borderRadiusLg, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.l },
  modalTitle: { ...typography.title, color: colors.primary, width: '85%' },
  modalSub: { ...typography.subhead, color: colors.textSecondary, marginTop: 4 },
  
  gifContainer: { width: '100%', height: 280, backgroundColor: colors.surfaceSecondary, borderRadius: ui.borderRadiusLg, marginBottom: ui.spacing.l, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  exerciseGif: { width: '100%', height: '100%' },

  modalStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: ui.spacing.l, gap: ui.spacing.m },
  statBox: { flex: 1, alignItems: 'center', padding: ui.spacing.m, backgroundColor: colors.surfaceSecondary, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border },
  statLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', marginBottom: 4 },
  statValue: { ...typography.headline, color: colors.primary },
  
  infoTitle: { ...typography.headline, color: colors.primary, marginBottom: ui.spacing.s, marginTop: ui.spacing.m },
  infoText: { ...typography.body, color: colors.textSecondary, marginBottom: ui.spacing.l, lineHeight: 24 },
  
  startBtn: { flexDirection: 'row', backgroundColor: colors.primary, height: ui.buttonHeight, borderRadius: ui.borderRadius, alignItems: 'center', justifyContent: 'center', marginTop: ui.spacing.m },
  startBtnText: { ...typography.headline, color: '#FFF' },

  loggerCard: { backgroundColor: colors.surfaceSecondary, padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, marginTop: ui.spacing.m, borderWidth: 1, borderColor: colors.border },
  loggerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: ui.spacing.s },
  loggerInputBox: { flex: 0.4 },
  loggerLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 6, fontWeight: '700' },
  loggerInput: { backgroundColor: colors.surface, paddingHorizontal: ui.spacing.m, height: 48, borderRadius: ui.borderRadiusSm, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, textAlign: 'center', ...typography.headline },
  logSetBtn: { backgroundColor: colors.primary, width: 48, height: 48, borderRadius: ui.borderRadiusSm, justifyContent: 'center', alignItems: 'center' }
});
