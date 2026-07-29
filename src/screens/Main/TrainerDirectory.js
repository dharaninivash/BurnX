import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrainerDirectory({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TRAINER CONSULTATIONS</Text>
          <Text style={styles.headerSub}>Certified BurnX Strength & Nutrition Coaches</Text>
        </View>

        {/* Locked Coming Soon View */}
        <View style={styles.lockContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={48} color={colors.primary} />
          </View>

          <View style={styles.badge}>
            <Ionicons name="rocket-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.badgeText}>COMING SOON</Text>
          </View>

          <Text style={styles.lockTitle}>Trainer Consultations Locked</Text>
          
          <Text style={styles.lockDesc}>
            Live 1-on-1 video consultations with certified strength coaches, sports nutritionists, and form evaluators are currently under active development.
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="videocam" size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.infoText}>HD Live Video Calls & Form Check Sessions</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.infoText}>Flexible Real-time Slot Reservations</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="ribbon" size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={styles.infoText}>Certified Hypertrophy & Macro Specialists</Text>
            </View>
          </View>

          <Text style={styles.patienceText}>This feature will be available in an upcoming BurnX release. Thank you for your patience.</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  header: { alignItems: 'center', marginBottom: 20, paddingTop: 10 },
  headerTitle: { ...typography.largeTitle, fontSize: 18, color: colors.primary, letterSpacing: 1.5 },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 4, fontWeight: '600' },
  
  lockContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 24, padding: 24, borderSize: 1, borderColor: colors.border, ...ui.shadow },
  iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(233, 30, 99, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: colors.primary },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(233, 30, 99, 0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.primary },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  lockTitle: { ...typography.largeTitle, fontSize: 20, color: colors.textPrimary, textAlign: 'center', marginBottom: 12 },
  lockDesc: { ...typography.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  
  infoCard: { width: '100%', backgroundColor: colors.background, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },

  patienceText: { fontSize: 11, color: colors.textTertiary, textAlign: 'center', fontStyle: 'italic' }
});
