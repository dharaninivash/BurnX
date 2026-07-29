import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function CalendarScreen({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const user = useStore((state) => state.user) || { gender: 'Male' };
  const lastPeriodDate = useStore((state) => state.lastPeriodDate);
  const cycleLength = useStore((state) => state.cycleLength) || 28;
  const currentMood = useStore((state) => state.currentMood) || 'Calm';
  const loggedSymptoms = useStore((state) => state.loggedSymptoms) || [];
  
  const logMoodAndCycle = useStore((state) => state.logMoodAndCycle);
  const sleepHours = useStore((state) => state.sleepHours) || 7.5;
  const setSleepHours = useStore((state) => state.setSleepHours);

  const [phase, setPhase] = useState('N/A');
  const [daysUntilNext, setDaysUntilNext] = useState(28);
  const [selectedMood, setSelectedMood] = useState(currentMood);
  const [selectedSymptoms, setSelectedSymptoms] = useState(loggedSymptoms);

  const moods = ['Happy', 'Energetic', 'Calm', 'Tired', 'Anxious', 'Sad'];
  const symptoms = ['Cramps', 'Headache', 'Bloating', 'Acne', 'Fatigue', 'Backache'];

  // Cycle phase calculation
  useEffect(() => {
    if (user?.gender === 'Female' && lastPeriodDate) {
      const lastDate = new Date(lastPeriodDate);
      const today = new Date();
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const cycleDay = diffDays % cycleLength;
      
      if (cycleDay >= 0 && cycleDay <= 5) setPhase('Menstruation (Day 1-5)');
      else if (cycleDay > 5 && cycleDay <= 13) setPhase('Follicular Phase (Day 6-13)');
      else if (cycleDay >= 14 && cycleDay <= 15) setPhase('Ovulation (Day 14-15)');
      else setPhase('Luteal Phase (Day 16-28)');

      setDaysUntilNext(cycleLength - cycleDay);
    }
  }, [lastPeriodDate, cycleLength, user]);

  const toggleSymptom = (s) => {
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(selectedSymptoms.filter(item => item !== s));
    } else {
      setSelectedSymptoms([...selectedSymptoms, s]);
    }
  };

  const handleLogPeriodToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    logMoodAndCycle(selectedMood, selectedSymptoms, todayStr);
    Alert.alert('Period Logged', 'Menstrual cycle start date updated to today successfully!');
  };

  const handleLogPeriodDaysAgo = (days) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    const dateStr = targetDate.toISOString().split('T')[0];
    logMoodAndCycle(selectedMood, selectedSymptoms, dateStr);
    Alert.alert('Period Logged', `Menstrual cycle start date configured to ${days} days ago!`);
  };

  const saveDailyWellnessLog = () => {
    // Save to Zustand
    logMoodAndCycle(selectedMood, selectedSymptoms, lastPeriodDate);
    Alert.alert('Wellness Saved', 'Your daily wellness metrics logged and saved offline. Central Readiness score updated!');
  };

  const adjustSleep = (amount) => {
    const nextHours = Math.max(1, Math.min(16, sleepHours + amount));
    setSleepHours(nextHours);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wellness Hub</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Universal Section: Sleep and Readiness */}
        <View style={styles.universalCard}>
          <Text style={styles.cardSectionTitle}>Sleep & Recovery Metrics</Text>
          <Text style={styles.cardDesc}>Log your yesterday sleep duration to update central neuromuscular readiness metrics.</Text>
          
          <View style={styles.sleepControlRow}>
            <TouchableOpacity onPress={() => adjustSleep(-0.5)} style={styles.sleepBtn}>
              <Ionicons name="remove" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.sleepValCol}>
              <Text style={styles.sleepHoursText}>{sleepHours} hrs</Text>
              <Text style={styles.sleepLabelText}>SLEEP QUALITY</Text>
            </View>
            <TouchableOpacity onPress={() => adjustSleep(0.5)} style={styles.sleepBtn}>
              <Ionicons name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. CYCLE TRACKING MODULE (For female athletes) */}
        {user?.gender === 'Female' ? (
          <View style={styles.pinkCard}>
            <View style={styles.pinkCardHeader}>
              <Ionicons name="flower" size={24} color="#E91E63" />
              <Text style={styles.pinkCardTitle}>Hormonal Cycle Diagnostics</Text>
            </View>

            {lastPeriodDate ? (
              <View style={styles.cycleReport}>
                <View style={styles.reportRow}>
                  <View style={styles.reportValBox}>
                    <Text style={styles.reportPhaseText}>{phase.split(' ')[0]}</Text>
                    <Text style={styles.reportSubLabel}>ACTIVE PHASE</Text>
                  </View>
                  <View style={styles.reportValBox}>
                    <Text style={[styles.reportPhaseText, { color: '#E91E63' }]}>{daysUntilNext}</Text>
                    <Text style={styles.reportSubLabel}>DAYS TO NEXT CYCLE</Text>
                  </View>
                </View>

                {/* Timeline display */}
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineNodesRow}>
                    {['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'].map((p) => {
                      const isActive = phase.toLowerCase().includes(p.toLowerCase());
                      return (
                        <View key={p} style={styles.timelineNodeCol}>
                          <View style={[styles.timelineNode, isActive && styles.timelineNodeActive]} />
                          <Text style={[styles.timelineNodeLabel, isActive && styles.timelineNodeLabelActive]}>{p}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
                
                {/* Physical activity adjustments coaching */}
                <Text style={styles.coachingLabel}>BurnX Physiological Advice</Text>
                <Text style={styles.coachingText}>
                  {phase.includes('Menstruation') ? '🔴 Gentle mobility and light recovery. Protect lower-abdomen cramps. Auto-applied workout deload.' :
                   phase.includes('Follicular') ? '⚡ Hypertrophy and strength growth! Oestrogen rises, muscle recovery is excellent. Increase gym sets.' :
                   phase.includes('Ovulation') ? '🔥 Absolute peak energy levels! Excellent central nervous drive. Ideal day to attempt lifting PRs.' :
                   '🧘 Steady-state cardio, moderate resistance reps, or stretching. Progesterone is winding down energy loops.'}
                </Text>
              </View>
            ) : (
              <View style={styles.noCycleReport}>
                <Text style={styles.noCycleText}>Sync your training split to your cycle by logging your last period start date below.</Text>
              </View>
            )}

            {/* Logger buttons */}
            <Text style={styles.logLabel}>Update Cycle Start Date</Text>
            <View style={styles.logButtonsRow}>
              <TouchableOpacity style={styles.logCycleBtn} onPress={handleLogPeriodToday}>
                <Text style={styles.logCycleBtnText}>Started Today</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.logCycleBtn, { backgroundColor: colors.background, borderWidth: 1, borderColor: '#E91E63' }]} onPress={() => handleLogPeriodDaysAgo(7)}>
                <Text style={[styles.logCycleBtnText, { color: '#E91E63' }]}>1 Week Ago</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.logCycleBtn, { backgroundColor: colors.background, borderWidth: 1, borderColor: '#E91E63' }]} onPress={() => handleLogPeriodDaysAgo(14)}>
                <Text style={[styles.logCycleBtnText, { color: '#E91E63' }]}>2 Weeks Ago</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.maleCard}>
            <View style={styles.pinkCardHeader}>
              <Ionicons name="fitness" size={24} color={colors.primary} />
              <Text style={[styles.pinkCardTitle, { color: colors.primary }]}>Wellness Optimization</Text>
            </View>
            <Text style={styles.noCycleText}>Training alignments are successfully calibrated for general strength progression split. Log daily recovery indicators below.</Text>
          </View>
        )}

        {/* 2. DAILY MOOD & SYMPTOM LOGGER */}
        <View style={styles.wellnessLoggerCard}>
          <Text style={styles.cardSectionTitle}>Daily Wellness Diagnostics</Text>
          
          {/* Mood Selector */}
          <Text style={styles.loggerSubLabel}>Select Mood & Energy Level</Text>
          <View style={styles.chipRow}>
            {moods.map((mood) => {
              const isActive = selectedMood === mood;
              return (
                <TouchableOpacity
                  key={mood}
                  style={[styles.moodChip, isActive && styles.activeMoodChip]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text style={[styles.chipText, isActive && { color: colors.textPrimary }]}>{mood}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Symptom Logger */}
          <Text style={[styles.loggerSubLabel, { marginTop: 15 }]}>Select Active Symptoms</Text>
          <View style={styles.chipRow}>
            {symptoms.map((symptom) => {
              const isActive = selectedSymptoms.includes(symptom);
              return (
                <TouchableOpacity
                  key={symptom}
                  style={[styles.symptomChip, isActive && styles.activeSymptomChip]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text style={[styles.chipText, isActive && { color: colors.textPrimary }]}>{symptom}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.saveWellnessBtn} onPress={saveDailyWellnessLog}>
            <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.saveWellnessBtnText}>Save Wellness Diagnostics</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 40 : 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { padding: 5 },
  headerTitle: { ...typography.header, color: colors.primary, fontSize: 20, fontWeight: '900', marginBottom: 0 },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 60 },

  universalCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadius, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  cardSectionTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  cardDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 16, marginBottom: 15 },
  
  sleepControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginVertical: 10 },
  sleepBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  sleepValCol: { alignItems: 'center', width: 140 },
  sleepHoursText: { fontSize: 28, fontWeight: '900', color: colors.primary },
  sleepLabelText: { fontSize: 8, fontWeight: 'bold', color: colors.textSecondary, letterSpacing: 1, marginTop: 4 },

  pinkCard: { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#E91E63', padding: 18, borderRadius: ui.borderRadius, ...ui.shadow, marginBottom: 20 },
  maleCard: { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: colors.primary, padding: 18, borderRadius: ui.borderRadius, ...ui.shadow, marginBottom: 20 },
  pinkCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  pinkCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#E91E63', marginLeft: 10 },
  
  noCycleReport: { marginVertical: 10 },
  noCycleText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  cycleReport: { marginVertical: 5 },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
  reportValBox: { flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 10, alignItems: 'center' },
  reportPhaseText: { fontSize: 16, fontWeight: '900', color: colors.textPrimary },
  reportSubLabel: { fontSize: 8, fontWeight: 'bold', color: colors.textSecondary, marginTop: 4 },
  
  timelineContainer: { marginVertical: 15, paddingHorizontal: 10 },
  timelineLine: { position: 'absolute', top: 5, left: 15, right: 15, height: 2, backgroundColor: colors.border },
  timelineNodesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineNodeCol: { alignItems: 'center', width: 60 },
  timelineNode: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, borderWidth: 2, borderColor: colors.surface, zIndex: 5 },
  timelineNodeActive: { backgroundColor: '#E91E63', borderColor: colors.textPrimary },
  timelineNodeLabel: { fontSize: 8, color: colors.textSecondary, fontWeight: 'bold', marginTop: 6, textAlign: 'center' },
  timelineNodeLabelActive: { color: '#E91E63' },
  
  coachingLabel: { fontSize: 11, fontWeight: 'bold', color: '#E91E63', marginTop: 10, marginBottom: 4 },
  coachingText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, fontStyle: 'italic' },

  logLabel: { fontSize: 12, fontWeight: 'bold', color: '#E91E63', marginTop: 15, marginBottom: 8 },
  logButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  logCycleBtn: { flex: 1, backgroundColor: '#E91E63', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  logCycleBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  wellnessLoggerCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadius, padding: 18, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  loggerSubLabel: { fontSize: 12, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  moodChip: { backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  activeMoodChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  symptomChip: { backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  activeSymptomChip: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  
  saveWellnessBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  saveWellnessBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
