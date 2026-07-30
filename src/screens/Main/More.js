import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

import SubscriptionModal from '../../components/SubscriptionModal';

import { supabase } from '../../services/supabase';

export default function More({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const user = useStore((state) => state.user) || { name: 'Athlete', email: 'athlete@burnx.com' };
  const logout = useStore((state) => state.logout);
  const activeStreak = useStore((state) => state.activeStreak) || 1;
  const themeMode = useStore((state) => state.themeMode) || 'dark';
  const setThemeMode = useStore((state) => state.setThemeMode);
  const isPremium = useStore((state) => state.isPremium);

  const [subModalVisible, setSubModalVisible] = React.useState(false);

  const handleLogout = async () => {
    // 1. Immediately reset Zustand store so UI instantly navigates to Login screen
    logout();

    // 2. Sign out of Supabase auth session
    try {
      if (supabase && supabase.auth) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch (e) {
      console.log('Supabase signout notice:', e);
    }
  };

  const menuItems = [
    { title: 'My Profile & Baseline', icon: 'person-outline', action: () => navigation.navigate('EditProfile') },
    { title: 'Wellness Calendar & Cycles', icon: 'calendar-outline', action: () => navigation.navigate('CalendarScreen') },
    { title: 'Menstrual Tracker', icon: 'flower-outline', action: () => navigation.navigate('MenstrualTracking') },
    { title: 'Dynamic Splits Setup', icon: 'construct-outline', action: () => navigation.navigate('Workout') },
    { title: 'Smart Hydration Settings', icon: 'water-outline', action: () => navigation.navigate('HydrationScreen') },
    { title: 'Reminders & Notification Bells', icon: 'notifications-outline', action: () => navigation.navigate('NotificationsScreen') },
    { title: 'Supplementation Stack Guide', icon: 'medical-outline', action: () => navigation.navigate('SupplementsScreen') },
    { title: 'CNS Readiness Metrics info', icon: 'analytics-outline', action: () => navigation.navigate('ReadinessScreen') },
    { title: 'About BurnX Engine', icon: 'information-circle-outline', action: () => navigation.navigate('AboutScreen') },
  ];

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>SETTINGS</Text>
        </View>

      {/* AVATAR PROFILE BANNER */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color="#FFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={12} color={colors.primary} />
            <Text style={styles.streakText}>{activeStreak} Day Active Streak</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editBtn}>
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* PREMIUM SUBSCRIPTION BANNER */}
      <TouchableOpacity 
        style={styles.subscriptionBanner} 
        onPress={() => setSubModalVisible(true)}
      >
        <Ionicons name="sparkles" size={24} color="#FFF" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.subBannerTitle}>{isPremium ? 'BurnX VIP Active ⚡' : 'Take Subscription'}</Text>
          <Text style={styles.subBannerDesc}>{isPremium ? 'Unlimited Coach & Features Unlocked' : 'Weekly / Monthly / Yearly Plans Available'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFF" />
      </TouchableOpacity>

      {/* MENU LIST ROW */}
      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
            <View style={styles.menuIconBox}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
          <View style={styles.menuIconBox}>
            <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuTitle}>{themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
          <Ionicons name="toggle" size={24} color={colors.primary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {/* LOGOUT ACTION BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

        <Text style={styles.copyrightText}>BurnX v1.0.0 Premium • Responsive Universal build</Text>
      </ScrollView>

      {/* SUBSCRIPTION SELECTION MODAL */}
      <SubscriptionModal
        visible={subModalVisible}
        onClose={() => setSubModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: ui.spacing.m, paddingBottom: ui.spacing.xs, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  headerTitle: { ...typography.largeTitle, color: colors.primary, letterSpacing: 1 },
  
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: ui.spacing.l, margin: ui.spacing.m, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, ...ui.shadowLg },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: ui.spacing.m },
  profileInfo: { flex: 1 },
  profileName: { ...typography.title, color: colors.textPrimary },
  profileEmail: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: ui.borderRadiusSm, alignSelf: 'flex-start', marginTop: ui.spacing.s, borderWidth: 1, borderColor: colors.border },
  streakText: { ...typography.caption, fontSize: 10, color: colors.primary, fontWeight: '700', marginLeft: 4 },
  editBtn: { padding: ui.spacing.s, backgroundColor: colors.surfaceSecondary, borderRadius: 12, borderWidth: 1, borderColor: colors.border },

  subscriptionBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, marginHorizontal: ui.spacing.m, padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, marginBottom: ui.spacing.l, ...ui.shadowLg },
  subBannerTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  subBannerDesc: { color: '#FFF', fontSize: 12, opacity: 0.9, marginTop: 2 },

  menuList: { backgroundColor: colors.surface, marginHorizontal: ui.spacing.m, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, ...ui.shadow, overflow: 'hidden', marginBottom: ui.spacing.l },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: ui.spacing.l, borderBottomWidth: 1, borderBottomColor: colors.surfaceSecondary },
  menuIconBox: { marginRight: ui.spacing.m, width: 24, alignItems: 'center' },
  menuTitle: { ...typography.subhead, color: colors.textPrimary, fontWeight: '700' },
  
  logoutBtn: { flexDirection: 'row', marginHorizontal: ui.spacing.m, height: ui.buttonHeight, backgroundColor: colors.surface, borderRadius: ui.borderRadius, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...ui.shadow, marginBottom: ui.spacing.xl },
  logoutText: { ...typography.headline, color: colors.error, marginLeft: 8 },
  copyrightText: { ...typography.footnote, color: colors.textSecondary, textAlign: 'center', marginBottom: 40 },
});
