import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import BurnX3DFitnessWidget from '../3d/BurnX3DFitnessWidget';

const { width } = Dimensions.get('window');

export default function AppleHeaderNavigation({
  title,
  subtitle,
  navigation,
  showBack = false,
  rightElement,
}) {
  const user = useStore((state) => state.user) || { name: 'Athlete' };
  const activeStreak = useStore((state) => state.activeStreak) || 1;
  const isPremium = useStore((state) => state.isPremium);

  const isWeb = Platform.OS === 'web';

  const webGlassStyle = isWeb
    ? {
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.08)',
      }
    : {};

  return (
    <View style={[styles.headerContainer, webGlassStyle]}>
      <View style={styles.leftSection}>
        {showBack && navigation?.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FF5722" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoRow}>
            <BurnX3DFitnessWidget type="ai_orb" width={32} height={32} />
            <Text style={styles.brandTitle}>BURN<Text style={styles.brandAccent}>X</Text></Text>
          </View>
        )}

        {title && (
          <View style={styles.titleCol}>
            <Text style={styles.mainTitle}>{title}</Text>
            {subtitle && <Text style={styles.subTitle}>{subtitle}</Text>}
          </View>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightElement || (
          <View style={styles.userBadgeRow}>
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={16} color="#FF5722" />
              <Text style={styles.streakVal}>{activeStreak}d</Text>
            </View>

            {isPremium && (
              <View style={styles.proBadge}>
                <Text style={styles.proText}>PRO</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 70,
    width: '100%',
    backgroundColor: 'rgba(18, 18, 22, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 100,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 87, 34, 0.12)',
    justify: 'center',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  brandAccent: {
    color: '#FF5722',
  },
  titleCol: {
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 34, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.3)',
    gap: 4,
  },
  streakVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5722',
  },
  proBadge: {
    backgroundColor: 'linear-gradient(90deg, #FF5722, #FF9800)',
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  proText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
