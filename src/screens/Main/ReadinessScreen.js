import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function ReadinessScreen({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);

  const readinessScore = useStore((state) => state.readinessScore);
  const sleepHours = useStore((state) => state.sleepHours);
  const setSleepHours = useStore((state) => state.setSleepHours);
  const currentMood = useStore((state) => state.currentMood);

  const handleSleepChange = (text) => {
    // Basic validation to only allow numbers and decimals
    const sanitized = text.replace(/[^0-9.]/g, '');
    if (sanitized !== '') {
      setSleepHours(parseFloat(sanitized));
    }
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

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Score Ring */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreRing}>
            <Text style={styles.scoreText}>{readinessScore}</Text>
            <Text style={styles.scoreSub}>SCORE</Text>
          </View>
          <Text style={styles.scoreLabel}>
            {readinessScore >= 80 ? 'Optimal Readiness' : readinessScore >= 50 ? 'Moderate Fatigue' : 'High Fatigue / Deload Recommended'}
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Diagnostic Inputs</Text>
          
          <View style={styles.inputRow}>
            <Ionicons name="moon-outline" size={24} color={colors.primary} />
            <Text style={styles.inputLabel}>Sleep (hours)</Text>
            <TextInput 
              style={styles.textInput}
              keyboardType="numeric"
              defaultValue={sleepHours.toString()}
              onChangeText={handleSleepChange}
              maxLength={4}
            />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="happy-outline" size={24} color={colors.primary} />
            <Text style={styles.inputLabel}>Current Mood</Text>
            <Text style={styles.valueText}>{currentMood}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            The Central Nervous System (CNS) Readiness Index dynamically computes your physiological preparedness by weighting your last night's sleep, your current psychological mood, and any active menstrual cycle phase (if configured). A higher score means your body is primed for intense athletic output.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  backBtn: { padding: 5 },
  headerTitle: { ...typography.title, fontSize: 18 },
  
  content: { padding: 20 },
  
  scoreContainer: { alignItems: 'center', marginVertical: 30 },
  scoreRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 8, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, ...ui.shadow },
  scoreText: { fontSize: 48, fontWeight: '900', color: colors.textPrimary },
  scoreSub: { fontSize: 12, fontWeight: 'bold', color: colors.textSecondary, letterSpacing: 2 },
  scoreLabel: { marginTop: 15, fontSize: 16, fontWeight: '600', color: colors.primary },

  card: { backgroundColor: colors.surface, padding: 20, borderRadius: ui.borderRadius, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 15 },
  
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  inputLabel: { flex: 1, fontSize: 15, color: colors.textPrimary, marginLeft: 15 },
  textInput: { backgroundColor: colors.background, color: colors.textPrimary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, minWidth: 80, textAlign: 'center', fontWeight: 'bold' },
  valueText: { fontSize: 16, fontWeight: 'bold', color: colors.primary },

  infoBox: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12 },
  infoText: { flex: 1, marginLeft: 10, fontSize: 12, color: colors.textSecondary, lineHeight: 18 }
});
