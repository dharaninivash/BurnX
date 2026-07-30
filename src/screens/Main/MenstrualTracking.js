import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MenstrualTracking({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;

  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui, isDesktop) : {};
  
  const user = useStore((state) => state.user) || {};
  const lastPeriodDate = useStore((state) => state.lastPeriodDate);
  const periodEndDate = useStore((state) => state.periodEndDate);
  const cycleLength = useStore((state) => state.cycleLength) || 28;
  const logMoodAndCycle = useStore((state) => state.logMoodAndCycle);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(lastPeriodDate || null);
  const [selectedEnd, setSelectedEnd] = useState(periodEndDate || null);
  const [phase, setPhase] = useState('N/A');
  const [phaseAdvice, setPhaseAdvice] = useState('');
  const [workoutRec, setWorkoutRec] = useState('');
  const [savedStatus, setSavedStatus] = useState('');

  // Cycle History Logs State
  const [cycleLogs, setCycleLogs] = useState([
    { id: '1', start: lastPeriodDate || '2026-07-15', end: periodEndDate || '2026-07-20', length: cycleLength }
  ]);

  if (user?.gender === 'Male') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MENSTRUAL TRACKING</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <View style={styles.maleNoticeBox}>
            <Ionicons name="lock-closed-outline" size={48} color="#FF9800" style={{ marginBottom: 15 }} />
            <Text style={styles.maleNoticeTitle}>Female Only Feature</Text>
            <Text style={styles.maleNoticeBody}>
              Menstrual cycle syncing is calibrated for female physiological hormonal phases. Your male account wellness metrics and CNS readiness are fully active in the Wellness Hub!
            </Text>
            <TouchableOpacity style={styles.maleNoticeBtn} onPress={() => navigation.navigate('CalendarScreen')}>
              <Ionicons name="heart-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.maleNoticeBtnText}>Go to Wellness Hub</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Calendar setup
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Predictions Calculation
  let predictions = null;
  if (selectedStart) {
    const start = new Date(selectedStart);
    
    // Next Cycle
    const nextCycleStart = new Date(start);
    nextCycleStart.setDate(start.getDate() + cycleLength);

    // Ovulation (typically Day 14 before next cycle)
    const ovulation = new Date(nextCycleStart);
    ovulation.setDate(nextCycleStart.getDate() - 14);

    // Fertile Window (5 days before ovulation + ovulation day)
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);
    const fertileEnd = new Date(ovulation);

    // PMS Period (7 days before next cycle start)
    const pmsStart = new Date(nextCycleStart);
    pmsStart.setDate(nextCycleStart.getDate() - 7);

    // Recovery Phase (Days 1 to 5 after period ends)
    const recoveryStart = selectedEnd ? new Date(selectedEnd) : new Date(start);

    predictions = {
      nextCycle: nextCycleStart.toISOString().split('T')[0],
      ovulation: ovulation.toISOString().split('T')[0],
      fertileWindow: `${fertileStart.toISOString().split('T')[0]} to ${fertileEnd.toISOString().split('T')[0]}`,
      pms: `${pmsStart.toISOString().split('T')[0]} to ${nextCycleStart.toISOString().split('T')[0]}`,
      recovery: selectedEnd ? `Post Period Recovery starting ${recoveryStart.toISOString().split('T')[0]}` : 'Active Period Recovery'
    };
  }

  useEffect(() => {
    if (selectedStart) {
      const lastDate = new Date(selectedStart);
      const today = new Date();
      const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
      const cycleDay = diffDays % cycleLength;
      
      if (cycleDay >= 0 && cycleDay <= 5) {
        setPhase('Menstruation (Day 1-5)');
        setPhaseAdvice('🔴 Energy levels are low due to low estrogen/progesterone. High inflammation risk.');
        setWorkoutRec('🧘 Restorative Child\'s Pose, Gentle Yoga, Cat-Cow Stretches, Light 20-min Walk.');
      } else if (cycleDay > 5 && cycleDay <= 13) {
        setPhase('Follicular Phase (Day 6-13)');
        setPhaseAdvice('⚡ Estrogen is surging! Insulin sensitivity and energy levels are high.');
        setWorkoutRec('🏋️ High Intensity Hypertrophy Training, Upper/Lower Heavy Splits, Progressive Overload.');
      } else if (cycleDay >= 14 && cycleDay <= 15) {
        setPhase('Ovulation (Day 14-15)');
        setPhaseAdvice('🔥 Peak strength, mood, and testosterone! Maximum power output potential.');
        setWorkoutRec('🏆 Attempt Personal Records (PRs) on Squats/Deadlifts, Heavy Compound Multi-Joint Exercises.');
      } else {
        setPhase('Luteal Phase (Day 16-28)');
        setPhaseAdvice('🧘 Progesterone rises. Metabolic rate increases but endurance slightly drops.');
        setWorkoutRec('🚴 Moderate Steady-State Cardio, Circuit Training, Pilates, High-Rep Accessory Work.');
      }
    }
  }, [selectedStart, cycleLength]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayPress = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd(null);
    } else {
      const startDate = new Date(selectedStart);
      const clickedDate = new Date(dateStr);
      if (clickedDate < startDate) {
        setSelectedStart(dateStr);
      } else {
        setSelectedEnd(dateStr);
      }
    }
  };

  const handleLogPeriodToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedStart(todayStr);
    setSelectedEnd(null);
    logMoodAndCycle('Calm', [], todayStr, null);
    setCycleLogs([{ id: Date.now().toString(), start: todayStr, end: todayStr, length: cycleLength }, ...cycleLogs]);
    setSavedStatus('Period Logged: Started Today ✓');
    setTimeout(() => setSavedStatus(''), 4000);
  };

  const handleLogPeriodDaysAgo = (days) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    const dateStr = targetDate.toISOString().split('T')[0];
    setSelectedStart(dateStr);
    setSelectedEnd(null);
    logMoodAndCycle('Calm', [], dateStr, null);
    setCycleLogs([{ id: Date.now().toString(), start: dateStr, end: dateStr, length: cycleLength }, ...cycleLogs]);
    setSavedStatus(`Period Logged: ${days === 7 ? '1 Week' : '2 Weeks'} Ago ✓`);
    setTimeout(() => setSavedStatus(''), 4000);
  };

  const saveDates = () => {
    if (selectedStart) {
      logMoodAndCycle('Calm', [], selectedStart, selectedEnd);
      setCycleLogs([{ id: Date.now().toString(), start: selectedStart, end: selectedEnd || selectedStart, length: cycleLength }, ...cycleLogs]);
      setSavedStatus('Cycle Parameters Saved Successfully ✓');
      setTimeout(() => setSavedStatus(''), 4000);
    }
  };

  const handleDeleteLog = (id) => {
    setCycleLogs(cycleLogs.filter(log => log.id !== id));
    setSavedStatus('Period Entry Removed');
    setTimeout(() => setSavedStatus(''), 3000);
  };

  const isSelected = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedStart || dateStr === selectedEnd;
  };

  const isInRange = (day) => {
    if (!selectedStart || !selectedEnd) return false;
    const date = new Date(year, month, day);
    const start = new Date(selectedStart);
    const end = new Date(selectedEnd);
    return date > start && date < end;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MENSTRUAL WELLNESS & CYCLE SYNCING</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Info Header */}
        <View style={styles.infoCard}>
          <Ionicons name="flower" size={24} color="#E91E63" />
          <Text style={styles.infoText}>Tap quick buttons or calendar dates to set period start. BurnX dynamically adapts workout intensities and predicts cycle milestones.</Text>
        </View>

        {/* Quick Period Tracking Buttons */}
        <View style={styles.quickLoggerCard}>
          <Text style={styles.quickLabel}>Quick Period Start Logger</Text>
          <View style={styles.logButtonsRow}>
            <TouchableOpacity style={styles.logCycleBtn} onPress={handleLogPeriodToday} activeOpacity={0.8}>
              <Ionicons name="flash" size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.logCycleBtnText}>Started Today</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logCycleBtnOutline} onPress={() => handleLogPeriodDaysAgo(7)} activeOpacity={0.8}>
              <Ionicons name="time-outline" size={16} color="#E91E63" style={{ marginRight: 4 }} />
              <Text style={styles.logCycleBtnOutlineText}>1 Week Ago</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logCycleBtnOutline} onPress={() => handleLogPeriodDaysAgo(14)} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={16} color="#E91E63" style={{ marginRight: 4 }} />
              <Text style={styles.logCycleBtnOutlineText}>2 Weeks Ago</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Toast */}
        {savedStatus !== '' && (
          <View style={styles.statusToast}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.statusToastText}>{savedStatus}</Text>
          </View>
        )}

        {/* Responsive Grid Layout for PC vs Mobile */}
        <View style={styles.mainLayout}>
          
          {/* LEFT COLUMN: Calendar & Date Controls */}
          <View style={styles.columnLeft}>
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={handlePrevMonth}>
                  <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.monthText}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                <TouchableOpacity onPress={handleNextMonth}>
                  <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.daysOfWeekRow}>
                {DAYS_OF_WEEK.map(day => (
                  <Text key={day} style={styles.dayOfWeekText}>{day}</Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayCell} />
                ))}
                
                {daysArray.map(day => {
                  const selected = isSelected(day);
                  const inRange = isInRange(day);
                  return (
                    <TouchableOpacity 
                      key={day} 
                      style={[
                        styles.dayCell, 
                        selected && styles.dayCellSelected,
                        inRange && styles.dayCellInRange
                      ]}
                      onPress={() => handleDayPress(day)}
                    >
                      <Text style={[
                        styles.dayText,
                        (selected || inRange) && styles.dayTextSelected
                      ]}>{day}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={saveDates} activeOpacity={0.8}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Save Period Dates</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* RIGHT COLUMN: Phase Diagnostics, Predictions & History */}
          <View style={styles.columnRight}>
            {selectedStart && (
              <>
                <View style={styles.phaseCard}>
                  <Text style={styles.phaseTitle}>Current Phase: <Text style={{ color: '#E91E63' }}>{phase}</Text></Text>
                  <Text style={styles.phaseAdvice}>{phaseAdvice}</Text>
                  
                  <View style={styles.workoutRecBox}>
                    <Ionicons name="barbell-outline" size={20} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.recTitle}>Recommended Training Focus</Text>
                      <Text style={styles.recText}>{workoutRec}</Text>
                    </View>
                  </View>
                </View>

                {/* Cycle Predictions Card */}
                {predictions && (
                  <View style={styles.predictionsCard}>
                    <Text style={styles.sectionTitle}>Calculated Cycle Predictions</Text>
                    <View style={styles.predGrid}>
                      <View style={styles.predItem}>
                        <Text style={styles.predLabel}>Next Cycle Start</Text>
                        <Text style={styles.predValue}>{predictions.nextCycle}</Text>
                      </View>
                      <View style={styles.predItem}>
                        <Text style={styles.predLabel}>Estimated Ovulation</Text>
                        <Text style={styles.predValue}>{predictions.ovulation}</Text>
                      </View>
                    </View>
                    <View style={styles.predGrid}>
                      <View style={styles.predItem}>
                        <Text style={styles.predLabel}>Fertile Window</Text>
                        <Text style={styles.predSubValue}>{predictions.fertileWindow}</Text>
                      </View>
                      <View style={styles.predItem}>
                        <Text style={styles.predLabel}>Expected PMS Phase</Text>
                        <Text style={styles.predSubValue}>{predictions.pms}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Period Logs History */}
            <View style={styles.historyCard}>
              <Text style={styles.sectionTitle}>Period Log History</Text>
              {cycleLogs.map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <View>
                    <Text style={styles.logDateText}>📅 Start: {log.start} → End: {log.end}</Text>
                    <Text style={styles.logSubText}>Cycle Duration Baseline: {log.length} Days</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteLog(log.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors, typography, ui, isDesktop) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 45 : 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 15 },
  backBtn: { padding: 8, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  headerTitle: { ...typography.largeTitle, fontSize: 14, color: colors.primary, letterSpacing: 1 },
  scrollContent: { 
    paddingHorizontal: isDesktop ? 30 : 15, 
    paddingBottom: 60, 
    maxWidth: isDesktop ? 1200 : 520, 
    width: '100%', 
    alignSelf: 'center' 
  },

  infoCard: { flexDirection: 'row', backgroundColor: colors.surface, padding: 14, borderRadius: ui.borderRadius, marginBottom: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  infoText: { flex: 1, ...typography.caption, marginLeft: 10, color: colors.textSecondary, lineHeight: 18 },

  quickLoggerCard: { backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadiusLg, marginBottom: 12, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  quickLabel: { fontSize: 13, fontWeight: '700', color: '#E91E63', marginBottom: 12 },
  logButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  logCycleBtn: { flex: 1, backgroundColor: '#E91E63', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logCycleBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  logCycleBtnOutline: { flex: 1, backgroundColor: colors.surfaceSecondary, borderWidth: 1.5, borderColor: '#E91E63', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logCycleBtnOutlineText: { color: '#E91E63', fontSize: 12, fontWeight: 'bold' },

  statusToast: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.15)', padding: 12, borderRadius: 10, marginBottom: 15, gap: 8 },
  statusToastText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 13, flex: 1 },

  mainLayout: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: isDesktop ? 20 : 0,
    alignItems: 'flex-start'
  },
  columnLeft: { flex: isDesktop ? 1 : undefined, width: isDesktop ? undefined : '100%' },
  columnRight: { flex: isDesktop ? 1 : undefined, width: isDesktop ? undefined : '100%' },

  calendarCard: { backgroundColor: colors.surface, padding: 18, borderRadius: ui.borderRadiusLg, ...ui.shadow, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  monthText: { ...typography.title, fontWeight: 'bold' },
  daysOfWeekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  dayOfWeekText: { ...typography.caption, fontWeight: 'bold', width: 40, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dayCell: { width: '14.28%', height: 38, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  dayCellSelected: { backgroundColor: '#E91E63', borderRadius: 19 },
  dayCellInRange: { backgroundColor: 'rgba(233, 30, 99, 0.2)' },
  dayText: { ...typography.body, fontWeight: '600' },
  dayTextSelected: { color: '#FFF' },

  saveBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15, flexDirection: 'row', ...ui.shadow },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  phaseCard: { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#E91E63', padding: 16, borderRadius: ui.borderRadiusLg, ...ui.shadow, marginBottom: 15, borderWidth: 1, borderColor: colors.border },
  phaseTitle: { ...typography.title, fontSize: 15, marginBottom: 6 },
  phaseAdvice: { ...typography.body, color: colors.textSecondary, lineHeight: 20, fontSize: 13 },
  workoutRecBox: { flexDirection: 'row', backgroundColor: colors.surfaceSecondary, padding: 12, borderRadius: 10, marginTop: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  recTitle: { fontSize: 12, fontWeight: 'bold', color: colors.primary },
  recText: { fontSize: 11, color: colors.textPrimary, marginTop: 2 },

  predictionsCard: { backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadiusLg, marginBottom: 15, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  sectionTitle: { ...typography.title, fontSize: 14, marginBottom: 12 },
  predGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 10 },
  predItem: { flex: 1, backgroundColor: colors.surfaceSecondary, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  predLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: 'bold' },
  predValue: { fontSize: 13, color: colors.primary, fontWeight: '900', marginTop: 4 },
  predSubValue: { fontSize: 11, color: colors.textPrimary, fontWeight: '700', marginTop: 4 },

  historyCard: { backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  logDateText: { fontSize: 12, fontWeight: 'bold', color: colors.textPrimary },
  logSubText: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  maleNoticeBox: { backgroundColor: colors.surface, padding: 25, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', maxWidth: 420, ...ui.shadowLg },
  maleNoticeTitle: { fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 10 },
  maleNoticeBody: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  maleNoticeBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, alignItems: 'center', ...ui.shadow },
  maleNoticeBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
