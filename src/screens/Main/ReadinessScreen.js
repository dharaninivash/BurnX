import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function ReadinessScreen({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;

  const styles = getStyles(colors, typography, ui, isDesktop);

  const readinessScore = useStore((state) => state.readinessScore);
  const sleepHours = useStore((state) => state.sleepHours);
  const setSleepHours = useStore((state) => state.setSleepHours);
  const currentMood = useStore((state) => state.currentMood) || 'Calm';
  const logMoodAndCycle = useStore((state) => state.logMoodAndCycle);

  const [localSleep, setLocalSleep] = useState(sleepHours ? sleepHours.toString() : '7.5');
  const [selectedMood, setSelectedMood] = useState(currentMood);
  const [saveStatus, setSaveStatus] = useState('');

  const moods = ['Happy', 'Energetic', 'Calm', 'Tired', 'Anxious', 'Sad'];

  const handleSleepChange = (text) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    setLocalSleep(sanitized);
  };

  const handleSaveDiagnostic = () => {
    const hours = parseFloat(localSleep) || 7.5;
    setSleepHours(hours);
    logMoodAndCycle(selectedMood, []);
    setSaveStatus('Wellness Diagnostic Saved ✓ Score Recalculated!');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CNS Diagnostics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.mainLayout}>
          
          {/* LEFT COLUMN: Score Ring & Info */}
          <View style={styles.columnLeft}>
            {/* Score Ring */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreRing}>
                <Text style={styles.scoreText}>{readinessScore}</Text>
                <Text style={styles.scoreSub}>SCORE</Text>
              </View>
              <Text style={styles.scoreLabel}>
                {readinessScore >= 80 ? 'Optimal Readiness ⚡' : readinessScore >= 50 ? 'Moderate Fatigue 🧘' : 'High Fatigue / Deload Recommended 🛑'}
              </Text>
            </View>

            {/* Info Section */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                The Central Nervous System (CNS) Readiness Index dynamically computes your physiological preparedness by weighting your last night's sleep, your current psychological mood, and any active menstrual cycle phase (if configured). A higher score means your body is primed for intense athletic output.
              </Text>
            </View>
          </View>

          {/* RIGHT COLUMN: Diagnostic Inputs & Save Button */}
          <View style={styles.columnRight}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Diagnostic Inputs</Text>
              
              <View style={styles.inputRow}>
                <Ionicons name="moon-outline" size={24} color={colors.primary} />
                <Text style={styles.inputLabel}>Sleep (hours)</Text>
                <TextInput 
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={localSleep}
                  onChangeText={handleSleepChange}
                  maxLength={4}
                />
              </View>

              {/* Mood Selector Chips */}
              <Text style={styles.moodLabel}>Current Psychological Mood</Text>
              <View style={styles.chipRow}>
                {moods.map((m) => {
                  const isActive = selectedMood === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.moodChip, isActive && styles.activeMoodChip]}
                      onPress={() => setSelectedMood(m)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isActive && { color: '#FFF' }]}>{m}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Save Button */}
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleSaveDiagnostic}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save Wellness Diagnostic</Text>
              </TouchableOpacity>

              {saveStatus !== '' && (
                <View style={styles.statusBanner}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.statusBannerText}>{saveStatus}</Text>
                </View>
              )}
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors, typography, ui, isDesktop) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 25 },
  backBtn: { padding: 5 },
  headerTitle: { ...typography.title, fontSize: 18 },
  
  content: { 
    padding: isDesktop ? 30 : 20, 
    paddingBottom: 60, 
    maxWidth: isDesktop ? 1100 : 500, 
    width: '100%', 
    alignSelf: 'center' 
  },

  mainLayout: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: isDesktop ? 24 : 0,
    alignItems: 'flex-start'
  },
  columnLeft: { flex: isDesktop ? 1 : undefined, width: isDesktop ? undefined : '100%' },
  columnRight: { flex: isDesktop ? 1 : undefined, width: isDesktop ? undefined : '100%' },
  
  scoreContainer: { alignItems: 'center', marginVertical: 20 },
  scoreRing: { width: 150, height: 150, borderRadius: 75, borderWidth: 8, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, ...ui.shadowLg },
  scoreText: { fontSize: 44, fontWeight: '900', color: colors.textPrimary },
  scoreSub: { fontSize: 12, fontWeight: 'bold', color: colors.textSecondary, letterSpacing: 2 },
  scoreLabel: { marginTop: 15, fontSize: 16, fontWeight: '600', color: colors.primary, textAlign: 'center' },

  card: { backgroundColor: colors.surface, padding: 20, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, marginBottom: 20, ...ui.shadow },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 15 },
  
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  inputLabel: { flex: 1, fontSize: 15, color: colors.textPrimary, marginLeft: 12, fontWeight: '600' },
  textInput: { backgroundColor: colors.surfaceSecondary || colors.background, color: colors.textPrimary, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, minWidth: 80, textAlign: 'center', fontWeight: 'bold', fontSize: 16, borderWidth: 1, borderColor: colors.border },
  
  moodLabel: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 10, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  moodChip: { backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  activeMoodChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },

  saveBtn: { flexDirection: 'row', backgroundColor: colors.primary, height: ui.buttonHeight || 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...ui.shadow },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  statusBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.15)', padding: 12, borderRadius: 10, marginTop: 12, gap: 8 },
  statusBannerText: { color: '#4CAF50', fontWeight: '700', fontSize: 13, flex: 1 },

  infoBox: { flexDirection: 'row', backgroundColor: colors.surface, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  infoText: { flex: 1, marginLeft: 10, fontSize: 12, color: colors.textSecondary, lineHeight: 18 }
});
