import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

export default function AboutScreen({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About BurnX</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Text style={styles.appName}>BURN<Text style={{ color: colors.primary }}>X</Text></Text>
          <Text style={styles.versionText}>v1.0.0 Premium</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconRow}>
            <Ionicons name="shield-checkmark" size={28} color={colors.success} />
            <Text style={styles.cardTitle}>100% Offline Privacy</Text>
          </View>
          <Text style={styles.cardText}>
            BurnX operates entirely on your device. We believe your biological data, menstrual cycles, and dietary habits belong to you. No servers. No telemetry. Total privacy.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconRow}>
            <Ionicons name="planet" size={28} color={colors.primary} />
            <Text style={styles.cardTitle}>The Universal Engine</Text>
          </View>
          <Text style={styles.cardText}>
            From predictive cycle-syncing to dynamic hypertrophy algorithms, the BurnX engine recalculates your BMR and athletic readiness in real-time without needing a connection.
          </Text>
        </View>

        <Text style={styles.footerText}>Made with ♥ for athletes worldwide.</Text>
      </View>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  backBtn: { padding: 5 },
  headerTitle: { ...typography.title, fontSize: 18 },
  
  content: { flex: 1, padding: 20, alignItems: 'center' },
  
  logoBox: { alignItems: 'center', marginVertical: 40 },
  appName: { fontSize: 48, fontWeight: '900', color: colors.textPrimary, letterSpacing: 2 },
  versionText: { fontSize: 14, fontWeight: 'bold', color: colors.primary, marginTop: 5, letterSpacing: 1 },

  card: { backgroundColor: colors.surface, padding: 20, borderRadius: ui.borderRadius, borderWidth: 1, borderColor: colors.border, marginBottom: 20, width: '100%', ...ui.shadow },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginLeft: 10 },
  cardText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  footerText: { fontSize: 12, color: colors.textSecondary, position: 'absolute', bottom: 40 }
});
