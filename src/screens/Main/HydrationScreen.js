import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function HydrationScreen({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  
  const waterIntake = useStore((state) => state.waterIntake);
  const waterIntakeGoal = useStore((state) => state.waterIntakeGoal);
  const addWater = useStore((state) => state.addWater);
  const resetWater = useStore((state) => state.resetWater);

  const fillPercentage = Math.min((waterIntake / waterIntakeGoal) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hydration Target</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.bottleContainer}>
          <View style={styles.bottleBackground}>
            <View style={[styles.bottleFill, { height: `${fillPercentage}%` }]} />
          </View>
          <Text style={styles.bottleText}>{Math.round(fillPercentage)}%</Text>
        </View>

        <Text style={styles.waterStats}>{waterIntake} ml / {waterIntakeGoal} ml</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addBtn} onPress={() => addWater(250)}>
            <Ionicons name="water" size={24} color="#FFF" />
            <Text style={styles.addBtnText}>+ 250ml</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={resetWater}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  backBtn: { padding: 5 },
  headerTitle: { ...typography.title, fontSize: 18 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  
  bottleContainer: { width: 120, height: 250, borderWidth: 4, borderColor: colors.border, borderRadius: 60, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 30, backgroundColor: colors.surface },
  bottleBackground: { position: 'absolute', bottom: 0, width: '100%', height: '100%', justifyContent: 'flex-end' },
  bottleFill: { width: '100%', backgroundColor: '#00B4D8' },
  bottleText: { position: 'absolute', bottom: '40%', fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  
  waterStats: { ...typography.header, marginBottom: 40 },
  
  actionButtons: { width: '80%', gap: 15 },
  addBtn: { flexDirection: 'row', backgroundColor: '#00B4D8', padding: 18, borderRadius: ui.borderRadius, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  resetBtn: { padding: 15, alignItems: 'center' },
  resetBtnText: { color: colors.error, fontSize: 16, fontWeight: 'bold' }
});
