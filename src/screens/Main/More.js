import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function More({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const user = useStore((state) => state.user) || { name: 'Athlete', email: 'athlete@fitaxis.com' };
  const logout = useStore((state) => state.logout);
  const activeStreak = useStore((state) => state.activeStreak) || 1;
  const themeMode = useStore((state) => state.themeMode) || 'dark';
  const setThemeMode = useStore((state) => state.setThemeMode);

  const handleLogout = () => {
    Alert.alert(
      'Reset Profile',
      'This will log you out and permanently delete all your local offline training, nutrition, and cycle logs. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset All', 
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  const triggerDevAlert = (title, msg) => {
    Alert.alert(title, `${msg} (This premium feature is pre-calibrated offline for optimal UX).`);
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
    { title: 'About FitAxis Engine', icon: 'information-circle-outline', action: () => navigation.navigate('AboutScreen') },
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

      {/* RESET/LOGOUT ACTION BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="trash-outline" size={18} color={colors.error} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Reset Offline Session</Text>
      </TouchableOpacity>

        <Text style={styles.copyrightText}>FitAxis v1.0.0 Premium • Responsive Universal build</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 15, paddingBottom: 5, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  headerTitle: { ...typography.header, color: colors.primary, fontSize: 22, fontWeight: '900' },
  
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 20, margin: 15, borderRadius: ui.borderRadius, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  profileEmail: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  streakText: { fontSize: 9, color: colors.primary, fontWeight: 'bold', marginLeft: 4 },
  editBtn: { padding: 8, backgroundColor: colors.background, borderRadius: 10, borderWidth: 1, borderColor: colors.border },

  menuList: { backgroundColor: colors.surface, marginHorizontal: 15, borderRadius: ui.borderRadius, borderWidth: 1, borderColor: colors.border, ...ui.shadow, overflow: 'hidden', marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.background },
  menuIconBox: { marginRight: 15 },
  menuTitle: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  
  logoutBtn: { flexDirection: 'row', marginHorizontal: 15, padding: 16, backgroundColor: colors.surface, borderRadius: ui.borderRadius, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...ui.shadow, marginBottom: 25 },
  logoutText: { color: colors.error, fontWeight: 'bold', fontSize: 15 },
  copyrightText: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginBottom: 40 },
});
