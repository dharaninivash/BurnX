import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function WorkoutTimer({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const [activeTab, setActiveTab] = useState('stopwatch'); // 'stopwatch', 'rest', 'countdown', 'tempo'
  
  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swActive, setSwActive] = useState(false);
  const [laps, setLaps] = useState([]);

  // Rest Timer State
  const [restTime, setRestTime] = useState(60); // Default 60s
  const [restActive, setRestActive] = useState(false);
  const [restRemaining, setRestRemaining] = useState(60);

  // Countdown Timer State
  const [cdTime, setCdTime] = useState(300); // Default 5 mins
  const [cdActive, setCdActive] = useState(false);
  const [cdRemaining, setCdRemaining] = useState(300);

  // Tempo Timer State
  const [tempoActive, setTempoActive] = useState(false);
  const [tempoPhase, setTempoPhase] = useState('Ready'); // 'Ready', 'Eccentric (Down)', 'Pause', 'Concentric (Up)'
  const [tempoSecs, setTempoSecs] = useState(0);

  // Interval Refs
  const swInterval = useRef(null);
  const restInterval = useRef(null);
  const cdInterval = useRef(null);
  const tempoInterval = useRef(null);

  // --- Stopwatch Logic ---
  useEffect(() => {
    if (swActive) {
      swInterval.current = setInterval(() => setSwTime((prev) => prev + 10), 10);
    } else {
      clearInterval(swInterval.current);
    }
    return () => clearInterval(swInterval.current);
  }, [swActive]);

  const formatStopwatch = (timeMs) => {
    const mins = Math.floor(timeMs / 60000);
    const secs = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 10);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}.${ms < 10 ? '0' : ''}${ms}`;
  };

  const handleSwLap = () => {
    setLaps([{ time: swTime, diff: laps.length > 0 ? swTime - laps[laps.length - 1].time : swTime }, ...laps]);
  };

  const handleSwReset = () => {
    setSwActive(false);
    setSwTime(0);
    setLaps([]);
  };

  // --- Rest Timer Logic ---
  useEffect(() => {
    if (restActive && restRemaining > 0) {
      restInterval.current = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(restInterval.current);
            setRestActive(false);
            // Simulate completion buzz / notice
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restInterval.current);
    }
    return () => clearInterval(restInterval.current);
  }, [restActive, restRemaining]);

  const formatRest = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- Countdown Timer Logic ---
  useEffect(() => {
    if (cdActive && cdRemaining > 0) {
      cdInterval.current = setInterval(() => {
        setCdRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(cdInterval.current);
            setCdActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(cdInterval.current);
    }
    return () => clearInterval(cdInterval.current);
  }, [cdActive, cdRemaining]);

  // --- Tempo Timer Logic (2s down, 1s pause, 1s up) ---
  useEffect(() => {
    if (tempoActive) {
      let currentPhase = tempoPhase === 'Ready' ? 'Eccentric (Down)' : tempoPhase;
      let secs = tempoPhase === 'Ready' ? 2 : tempoSecs;
      
      setTempoPhase(currentPhase);
      setTempoSecs(secs);

      tempoInterval.current = setInterval(() => {
        setTempoSecs((prev) => {
          if (prev <= 1) {
            // Switch phase
            setTempoPhase((p) => {
              if (p === 'Eccentric (Down)') {
                secs = 1;
                return 'Pause';
              }
              if (p === 'Pause') {
                secs = 1;
                return 'Concentric (Up)';
              }
              if (p === 'Concentric (Up)') {
                secs = 2;
                return 'Eccentric (Down)';
              }
              return 'Ready';
            });
            return secs;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(tempoInterval.current);
    }
    return () => clearInterval(tempoInterval.current);
  }, [tempoActive]);

  const resetTempo = () => {
    setTempoActive(false);
    setTempoPhase('Ready');
    setTempoSecs(0);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BurnX Timers</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {['stopwatch', 'rest', 'countdown', 'tempo'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabBtn, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        
        {/* 1. STOPWATCH */}
        {activeTab === 'stopwatch' && (
          <View style={styles.timerWrapper}>
            <View style={styles.displayCard}>
              <Text style={styles.timeDisplay}>{formatStopwatch(swTime)}</Text>
            </View>
            
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlBtnSecondary} onPress={swActive ? handleSwLap : handleSwReset}>
                <Text style={styles.controlBtnText}>{swActive ? 'Lap' : 'Reset'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlBtnPrimary, { backgroundColor: swActive ? colors.error : colors.success }]} 
                onPress={() => setSwActive(!swActive)}
              >
                <Text style={styles.controlBtnText}>{swActive ? 'Stop' : 'Start'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.lapHeader}>Laps Record</Text>
            <ScrollView style={styles.lapsContainer} showsVerticalScrollIndicator={false}>
              {laps.length === 0 ? (
                <Text style={styles.emptyLapsText}>Laps logged during active stopwatch will show here.</Text>
              ) : (
                laps.map((lap, index) => (
                  <View key={index} style={styles.lapRow}>
                    <Text style={styles.lapIndexText}>LAP {laps.length - index}</Text>
                    <Text style={styles.lapDiffText}>+{formatStopwatch(lap.diff)}</Text>
                    <Text style={styles.lapTimeText}>{formatStopwatch(lap.time)}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {/* 2. REST TIMER */}
        {activeTab === 'rest' && (
          <View style={styles.timerWrapper}>
            <View style={styles.displayCard}>
              <Text style={styles.timeDisplay}>{formatRest(restRemaining)}</Text>
              <Text style={styles.subTimerLabel}>REST REMAINING</Text>
            </View>
            
            {!restActive && restRemaining === restTime && (
              <View style={styles.presetSection}>
                <Text style={styles.presetSectionLabel}>Tap to select rest duration</Text>
                <View style={styles.presetRow}>
                  {[30, 60, 90, 120].map((t) => (
                    <TouchableOpacity key={t} style={[styles.presetBtn, restTime === t && styles.activePresetBtn]} onPress={() => { setRestTime(t); setRestRemaining(t); }}>
                      <Text style={[styles.presetText, restTime === t && { color: '#FFF' }]}>{t}s</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlBtnSecondary} onPress={() => { setRestActive(false); setRestRemaining(restTime); }}>
                <Text style={styles.controlBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlBtnPrimary, { backgroundColor: restActive ? colors.error : colors.success }]} 
                onPress={() => {
                  if (restRemaining === 0) setRestRemaining(restTime);
                  setRestActive(!restActive);
                }}
              >
                <Text style={styles.controlBtnText}>{restActive ? 'Pause' : 'Start'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3. COUNTDOWN */}
        {activeTab === 'countdown' && (
          <View style={styles.timerWrapper}>
            <View style={styles.displayCard}>
              <Text style={styles.timeDisplay}>{formatRest(cdRemaining)}</Text>
              <Text style={styles.subTimerLabel}>COUNTDOWN</Text>
            </View>
            
            {!cdActive && cdRemaining === cdTime && (
              <View style={styles.presetSection}>
                <Text style={styles.presetSectionLabel}>Tap to select workout block duration</Text>
                <View style={styles.presetRow}>
                  {[60, 300, 600, 1800].map((t) => (
                    <TouchableOpacity key={t} style={[styles.presetBtn, cdTime === t && styles.activePresetBtn]} onPress={() => { setCdTime(t); setCdRemaining(t); }}>
                      <Text style={[styles.presetText, cdTime === t && { color: '#FFF' }]}>{t / 60}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlBtnSecondary} onPress={() => { setCdActive(false); setCdRemaining(cdTime); }}>
                <Text style={styles.controlBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlBtnPrimary, { backgroundColor: cdActive ? colors.error : colors.success }]} 
                onPress={() => {
                  if (cdRemaining === 0) setCdRemaining(cdTime);
                  setCdActive(!cdActive);
                }}
              >
                <Text style={styles.controlBtnText}>{cdActive ? 'Pause' : 'Start'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 4. TEMPO METRONOME */}
        {activeTab === 'tempo' && (
          <View style={styles.timerWrapper}>
            <View style={[styles.displayCard, { backgroundColor: tempoPhase === 'Eccentric (Down)' ? 'rgba(233, 30, 99, 0.1)' : tempoPhase === 'Concentric (Up)' ? 'rgba(76, 175, 80, 0.1)' : colors.surface }]}>
              <Text style={[styles.timeDisplay, { fontSize: 80 }]}>{tempoActive ? tempoSecs : '0'}</Text>
              <Text style={[styles.subTimerLabel, { fontSize: 16, color: tempoPhase === 'Eccentric (Down)' ? '#E91E63' : tempoPhase === 'Concentric (Up)' ? '#4CAF50' : colors.primary }]}>
                {tempoPhase.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.presetSection}>
              <Text style={styles.presetSectionLabel}>Standard Hypertrophy Tempo: 2s Down, 1s Pause, 1s Up</Text>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlBtnSecondary} onPress={resetTempo}>
                <Text style={styles.controlBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlBtnPrimary, { backgroundColor: tempoActive ? colors.error : colors.success }]} 
                onPress={() => setTempoActive(!tempoActive)}
              >
                <Text style={styles.controlBtnText}>{tempoActive ? 'Stop' : 'Start'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 },
  headerTitle: { ...typography.header, color: colors.primary, fontSize: 20, fontWeight: '900', marginBottom: 0 },
  backBtn: { padding: 5 },
  
  tabsRow: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: 16, padding: 5, marginBottom: 25, borderWidth: 1, borderColor: colors.border },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 11, color: colors.textSecondary, fontWeight: '900', letterSpacing: 0.5 },
  tabTextActive: { color: '#FFF' },
  
  content: { flex: 1, paddingHorizontal: 20 },
  timerWrapper: { flex: 1, alignItems: 'center' },
  
  displayCard: { width: '100%', backgroundColor: colors.surface, paddingVertical: 40, borderRadius: ui.borderRadius, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...ui.shadow, marginBottom: 30 },
  timeDisplay: { fontSize: 58, fontWeight: '200', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  subTimerLabel: { fontSize: 10, fontWeight: 'bold', color: colors.primary, letterSpacing: 2, marginTop: 10 },
  
  controlsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 30, paddingHorizontal: 20 },
  controlBtnPrimary: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', ...ui.shadow },
  controlBtnSecondary: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  controlBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  lapHeader: { alignSelf: 'flex-start', fontSize: 13, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  lapsContainer: { flex: 1, width: '100%' },
  emptyLapsText: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 20 },
  lapRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  lapIndexText: { fontSize: 12, fontWeight: 'bold', color: colors.textSecondary },
  lapDiffText: { fontSize: 12, color: colors.primary, fontVariant: ['tabular-nums'] },
  lapTimeText: { fontSize: 12, color: colors.textPrimary, fontVariant: ['tabular-nums'], fontWeight: '600' },
  
  presetSection: { width: '100%', marginBottom: 35 },
  presetSectionLabel: { fontSize: 11, fontWeight: 'bold', color: colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  presetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  presetBtn: { flex: 1, backgroundColor: colors.surface, paddingVertical: 10, borderRadius: 10, marginHorizontal: 4, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  activePresetBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetText: { color: colors.primary, fontWeight: 'bold', fontSize: 13 },
});
