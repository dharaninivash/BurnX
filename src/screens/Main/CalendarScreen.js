import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Dimensions, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function CalendarScreen({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;

  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui, isDesktop) : {};
  const user = useStore((state) => state.user) || { gender: 'Female' };
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
  const [saveStatus, setSaveStatus] = useState('');

  const moods = ['Happy', 'Energetic', 'Calm', 'Tired', 'Anxious', 'Sad'];
  const symptoms = ['Cramps', 'Headache', 'Bloating', 'Acne', 'Fatigue', 'Backache'];

  // Cycle phase calculation
  useEffect(() => {
    if (lastPeriodDate) {
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
  }, [lastPeriodDate, cycleLength]);

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
    setSaveStatus('Period Logged: Started Today ✓');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const handleLogPeriodDaysAgo = (days) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    const dateStr = targetDate.toISOString().split('T')[0];
    logMoodAndCycle(selectedMood, selectedSymptoms, dateStr);
    setSaveStatus(`Period Logged: ${days === 7 ? '1 Week' : '2 Weeks'} Ago ✓`);
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const saveDailyWellnessLog = () => {
    logMoodAndCycle(selectedMood, selectedSymptoms, lastPeriodDate);
    setSaveStatus('Wellness Diagnostics Saved ✓ Central Readiness Updated!');
    setTimeout(() => setSaveStatus(''), 4000);
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
        <Text style={styles.headerTitle}>WELLNESS HUB & CYCLE SYNC</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MenstrualTracking')} style={styles.calendarBtn}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          {isDesktop && <Text style={styles.calendarBtnText}>Full Calendar</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {saveStatus !== '' && (
          <View style={styles.statusToast}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.statusToastText}>{saveStatus}</Text>
          </View>
        )}

        {/* Main Grid: Responsive Row for Desktop (PC) or Column for Mobile */}
        <View style={styles.mainLayout}>
          
          {/* LEFT COLUMN: Sleep & Hormonal Cycle Diagnostics */}
          <View style={styles.columnLeft}>
            {/* Universal Section: Sleep and Readiness */}
            <View style={styles.universalCard}>
              <Text style={styles.cardSectionTitle}>Sleep & Recovery Metrics</Text>
              <Text style={styles.cardDesc}>Log yesterday's sleep duration to update central neuromuscular readiness metrics.</Text>
              
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

            {/* CYCLE TRACKING MODULE FOR FEMALES / RECOVERY FOR MALES */}
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

                {/* Quick Logger buttons */}
                <Text style={styles.logLabel}>Update Period Start Date</Text>
                <View style={styles.logButtonsRow}>
                  <TouchableOpacity style={styles.logCycleBtn} onPress={handleLogPeriodToday} activeOpacity={0.8}>
                    <Text style={styles.logCycleBtnText}>Started Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.logCycleBtn, { backgroundColor: colors.surfaceSecondary, borderWidth: 1.5, borderColor: '#E91E63' }]} onPress={() => handleLogPeriodDaysAgo(7)} activeOpacity={0.8}>
                    <Text style={[styles.logCycleBtnText, { color: '#E91E63' }]}>1 Week Ago</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.logCycleBtn, { backgroundColor: colors.surfaceSecondary, borderWidth: 1.5, borderColor: '#E91E63' }]} onPress={() => handleLogPeriodDaysAgo(14)} activeOpacity={0.8}>
                    <Text style={[styles.logCycleBtnText, { color: '#E91E63' }]}>2 Weeks Ago</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.universalCard, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                  <Text style={[styles.cardSectionTitle, { marginLeft: 10, marginBottom: 0 }]}>Male Strength & Neuromuscular Baseline</Text>
                </View>
                <Text style={styles.cardDesc}>
                  Menstrual tracking is disabled for male accounts. Your readiness score and workout volume recommendations focus directly on circadian sleep duration, macronutrient synthesis, and CNS fatigue.
                </Text>
              </View>
            )}
          </View>

          {/* RIGHT COLUMN: Daily Mood & Symptom Logger + Diagnostic Info */}
          <View style={styles.columnRight}>
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
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isActive && { color: '#FFF' }]}>{mood}</Text>
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
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isActive && { color: '#FFF' }]}>{symptom}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.saveWellnessBtn} onPress={saveDailyWellnessLog} activeOpacity={0.8}>
                <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveWellnessBtnText}>Save Wellness Diagnostics</Text>
              </TouchableOpacity>
            </View>

            {/* Extra PC Card: CNS & Health Insights */}
            <View style={styles.insightsCard}>
              <View style={styles.insightsHeader}>
                <Ionicons name="fitness-outline" size={22} color={colors.primary} />
                <Text style={styles.insightsTitle}>Central Readiness Index</Text>
              </View>
              <Text style={styles.insightsText}>
                Your daily wellness diagnostics directly modulate the AI Coach algorithms and dynamic workout rep schemes. Keeping these updated ensures optimized stress management and prevents central neuromuscular burnout.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ReadinessScreen')} style={styles.readinessNavBtn}>
                <Text style={styles.readinessNavText}>View Detailed CNS Metrics →</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors, typography, ui, isDesktop) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 40 : 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { padding: 5 },
  headerTitle: { ...typography.header, color: colors.primary, fontSize: 18, fontWeight: '900', marginBottom: 0 },
  calendarBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  calendarBtnText: { color: colors.primary, fontWeight: 'bold', marginLeft: 6, fontSize: 12 },

  scrollContent: { 
    paddingHorizontal: isDesktop ? 30 : 15, 
    paddingBottom: 60, 
    maxWidth: isDesktop ? 1200 : 520, 
    width: '100%', 
    alignSelf: 'center' 
  },

  statusToast: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.15)', padding: 12, borderRadius: 10, marginBottom: 15, gap: 8 },
  statusToastText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 13, flex: 1 },

  mainLayout: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: isDesktop ? 20 : 0,
    alignItems: 'flex-start'
  },
  columnLeft: { flex: isDesktop ? 1 : undefined, width: isDesktop ? undefined : '100%' },
  columnRight: { flex: isDesktop ? 1 : undefined, width: isDesktop ? undefined : '100%' },

  universalCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  cardSectionTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  cardDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 16, marginBottom: 15 },
  
  sleepControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginVertical: 10 },
  sleepBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  sleepValCol: { alignItems: 'center', width: 140 },
  sleepHoursText: { fontSize: 28, fontWeight: '900', color: colors.primary },
  sleepLabelText: { fontSize: 8, fontWeight: 'bold', color: colors.textSecondary, letterSpacing: 1, marginTop: 4 },

  pinkCard: { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#E91E63', padding: 18, borderRadius: ui.borderRadiusLg, ...ui.shadow, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
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
  logCycleBtn: { flex: 1, backgroundColor: '#E91E63', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  logCycleBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  wellnessLoggerCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: 18, borderWidth: 1, borderColor: colors.border, ...ui.shadow, marginBottom: 20 },
  loggerSubLabel: { fontSize: 12, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  moodChip: { backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  activeMoodChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  symptomChip: { backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  activeSymptomChip: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  
  saveWellnessBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15, ...ui.shadow },
  saveWellnessBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  insightsCard: { backgroundColor: colors.surface, padding: 18, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  insightsTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, marginLeft: 8 },
  insightsText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  readinessNavBtn: { alignSelf: 'flex-start' },
  readinessNavText: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
});
