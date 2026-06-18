import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

export default function SupplementsScreen({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);

  const supplements = [
    { name: 'Whey Protein', use: 'Muscle recovery & synthesis post-workout. Fast absorbing protein source.', icon: 'beaker-outline' },
    { name: 'Creatine Monohydrate', use: 'Increases ATP production, strength output, and cellular hydration.', icon: 'flash-outline' },
    { name: 'Omega-3 Fish Oil', use: 'Reduces joint inflammation, supports heart and brain health.', icon: 'fish-outline' },
    { name: 'BCAA / EAA', use: 'Prevents muscle breakdown during fasted cardio or long sessions.', icon: 'water-outline' },
    { name: 'Multivitamins', use: 'Fills micronutrient gaps to support general wellness and immunity.', icon: 'medkit-outline' },
    { name: 'Magnesium Glycinate', use: 'Improves sleep quality, muscle relaxation, and CNS recovery.', icon: 'moon-outline' },
    { name: 'Citrulline Malate', use: 'Boosts nitric oxide for better blood flow, endurance, and muscle pumps.', icon: 'fitness-outline' },
    { name: 'Mass Gainers', use: 'High calorie blend of carbs and protein for hard gainers in bulk phase.', icon: 'barbell-outline' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supplementation Stack</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Medical Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="warning" size={28} color="#FFF" style={{ marginBottom: 10 }} />
          <Text style={styles.disclaimerTitle}>MEDICAL DISCLAIMER</Text>
          <Text style={styles.disclaimerText}>
            The supplements listed below are for educational purposes only. Always use supplements with proper guidance and consult a doctor or healthcare professional before adding them to your routine, especially if you have pre-existing conditions or are pregnant.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Common Fitness Supplements</Text>
        
        {supplements.map((item, index) => (
          <View key={index} style={styles.suppCard}>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.suppInfo}>
              <Text style={styles.suppName}>{item.name}</Text>
              <Text style={styles.suppUse}>{item.use}</Text>
            </View>
          </View>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  backBtn: { padding: 5 },
  headerTitle: { ...typography.title, fontSize: 18 },
  
  content: { padding: 15 },
  
  disclaimerCard: { backgroundColor: '#FF4C4C', padding: 20, borderRadius: ui.borderRadius, marginBottom: 25, ...ui.shadow, alignItems: 'center' },
  disclaimerTitle: { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: 1, marginBottom: 8 },
  disclaimerText: { fontSize: 12, color: '#FFF', textAlign: 'center', lineHeight: 18, opacity: 0.9 },
  
  sectionTitle: { ...typography.header, fontSize: 20, marginBottom: 15, color: colors.primary },
  
  suppCard: { flexDirection: 'row', backgroundColor: colors.surface, padding: 15, borderRadius: ui.borderRadius, marginBottom: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 122, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  suppInfo: { flex: 1 },
  suppName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  suppUse: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 }
});
