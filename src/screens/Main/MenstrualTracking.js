import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MenstrualTracking({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  
  const lastPeriodDate = useStore((state) => state.lastPeriodDate);
  const periodEndDate = useStore((state) => state.periodEndDate);
  const cycleLength = useStore((state) => state.cycleLength) || 28;
  const logMoodAndCycle = useStore((state) => state.logMoodAndCycle);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(lastPeriodDate || null);
  const [selectedEnd, setSelectedEnd] = useState(periodEndDate || null);
  const [phase, setPhase] = useState('N/A');
  const [phaseAdvice, setPhaseAdvice] = useState('');

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (selectedStart) {
      const lastDate = new Date(selectedStart);
      const today = new Date();
      const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
      const cycleDay = diffDays % cycleLength;
      
      if (cycleDay >= 0 && cycleDay <= 5) {
        setPhase('Menstruation');
        setPhaseAdvice('🔴 Energy levels are low. Focus on gentle recovery, yoga, or light dumbbell sessions.');
      } else if (cycleDay > 5 && cycleDay <= 13) {
        setPhase('Follicular Phase');
        setPhaseAdvice('⚡ Estrogen is rising! Perfect time to increase hypertrophy weights and push sets.');
      } else if (cycleDay >= 14 && cycleDay <= 15) {
        setPhase('Ovulation');
        setPhaseAdvice('🔥 Peak strength and energy! Ideal day to attempt a personal record (PR) on squats or presses.');
      } else {
        setPhase('Luteal Phase');
        setPhaseAdvice('🧘 Energy is tapering down. Switch to moderate weights, higher reps, or aerobic conditioning.');
      }
    }
  }, [selectedStart, cycleLength]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayPress = (day) => {
    const selectedDateStr = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
    
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start fresh
      setSelectedStart(selectedDateStr);
      setSelectedEnd(null);
    } else {
      // We have a start but no end
      const startDate = new Date(selectedStart);
      const clickedDate = new Date(selectedDateStr);
      
      if (clickedDate < startDate) {
        // If clicked before start, make it the new start
        setSelectedStart(selectedDateStr);
      } else {
        setSelectedEnd(selectedDateStr);
      }
    }
  };

  const saveDates = () => {
    if (selectedStart) {
      logMoodAndCycle('Calm', [], selectedStart, selectedEnd);
      Alert.alert('Saved', 'Your menstrual cycle dates have been updated successfully.');
    }
  };

  const isSelected = (day) => {
    const dateStr = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
    return dateStr === selectedStart || dateStr === selectedEnd;
  };

  const isInRange = (day) => {
    if (!selectedStart || !selectedEnd) return false;
    const date = new Date(Date.UTC(year, month, day));
    const start = new Date(selectedStart);
    const end = new Date(selectedEnd);
    return date > start && date < end;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cycle Tracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>Tap a date to set the start of your period. Tap a second date to set the end of your period.</Text>
        </View>

        {/* Calendar UI */}
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

          <TouchableOpacity style={styles.saveBtn} onPress={saveDates}>
            <Text style={styles.saveBtnText}>Save Cycle Dates</Text>
          </TouchableOpacity>
        </View>

        {/* Phase Diagnostics */}
        {selectedStart && (
          <View style={styles.phaseCard}>
            <Text style={styles.phaseTitle}>Current Phase: <Text style={{ color: '#E91E63' }}>{phase}</Text></Text>
            <Text style={styles.phaseAdvice}>{phaseAdvice}</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 40 : 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { padding: 5, backgroundColor: colors.surface, borderRadius: 20 },
  headerTitle: { ...typography.header, color: colors.primary, fontSize: 20, fontWeight: '900', marginBottom: 0 },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 60 },

  infoCard: { flexDirection: 'row', backgroundColor: colors.surface, padding: 15, borderRadius: ui.borderRadius, marginBottom: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  infoText: { flex: 1, ...typography.caption, marginLeft: 10, color: colors.textSecondary },

  calendarCard: { backgroundColor: colors.surface, padding: 20, borderRadius: ui.borderRadius, ...ui.shadow, marginBottom: 20 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  monthText: { ...typography.title, fontWeight: 'bold' },
  daysOfWeekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  dayOfWeekText: { ...typography.caption, fontWeight: 'bold', width: 40, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dayCell: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  dayCellSelected: { backgroundColor: '#E91E63', borderRadius: 20 },
  dayCellInRange: { backgroundColor: 'rgba(233, 30, 99, 0.2)' },
  dayText: { ...typography.body, fontWeight: '600' },
  dayTextSelected: { color: '#FFF' },

  saveBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  phaseCard: { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#E91E63', padding: 18, borderRadius: ui.borderRadius, ...ui.shadow },
  phaseTitle: { ...typography.title, fontSize: 16, marginBottom: 10 },
  phaseAdvice: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
});
