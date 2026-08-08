import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

import SubscriptionModal from '../../components/SubscriptionModal';
import { supabase } from '../../services/supabase';

export default function More({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  const user = useStore((state) => state.user) || { name: 'Athlete', email: 'athlete@burnx.com' };
  const logout = useStore((state) => state.logout);
  const activeStreak = useStore((state) => state.activeStreak) || 1;
  const isPremium = useStore((state) => state.isPremium);

  const [subModalVisible, setSubModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [confirmInputText, setConfirmInputText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = useStore((state) => state.deleteAccount);

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

  const handleOpenDeleteModal = () => {
    setConfirmInputText('');
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmInputText.trim() !== 'CONFIRM') {
      Alert.alert('Confirmation Mismatch', 'Please type CONFIRM exactly in capital letters to delete your account.');
      return;
    }
    setIsDeleting(true);
    try {
      setDeleteModalVisible(false);
      await deleteAccount();
    } catch (e) {
      console.log('Error during account deletion:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const menuItems = [
    { title: 'Manage Subscription & Refund Policy', icon: 'card-outline', action: () => setSubModalVisible(true) },
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        
        {/* HEADER */}
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>HUB & OPTIONS</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#FFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name || 'Athlete'}</Text>
            <Text style={styles.profileEmail}>{user.email || 'client@burnx.com'}</Text>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color={colors.primary} />
              <Text style={styles.streakText}>{activeStreak} Day Fitness Streak</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* VIP SUBSCRIPTION BANNER */}
        <TouchableOpacity 
          style={styles.subscriptionBanner} 
          onPress={() => setSubModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.subBannerTitle}>
              {isPremium ? '👑 VIP Champion Plan Active' : '🚀 Upgrade to BurnX Premium'}
            </Text>
            <Text style={styles.subBannerDesc}>
              {isPremium ? 'Enjoy full access to AI Coach & recovery' : 'Unlock full AI Coach & Menstrual Engine from ₹10'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#FFF" />
        </TouchableOpacity>

        {/* MENU LIST */}
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action} activeOpacity={0.7}>
              <View style={styles.menuIconBox}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT & DELETE ACCOUNT ACTION BUTTONS */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleOpenDeleteModal} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={20} color="#FF4D4D" style={{ marginRight: 8 }} />
            <Text style={styles.deleteText}>Delete My Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyrightText}>BurnX v1.0.0 Premium • Responsive Universal build</Text>
      </ScrollView>

      {/* SUBSCRIPTION SELECTION MODAL */}
      <SubscriptionModal
        visible={subModalVisible}
        onClose={() => setSubModalVisible(false)}
      />

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.warningIconCircle}>
              <Ionicons name="alert-circle-outline" size={42} color="#FF4D4D" />
            </View>
            <Text style={styles.modalTitle}>PERMANENTLY DELETE ACCOUNT?</Text>
            <Text style={styles.modalSub}>
              This action is <Text style={{ fontWeight: 'bold', color: '#FF4D4D' }}>IRREVERSIBLE</Text>. All your profile details, metabolic targets, calorie logs, and database records will be erased forever.
            </Text>
            <Text style={styles.modalPrompt}>
              To confirm, type <Text style={styles.capitalTag}>CONFIRM</Text> in capital letters below:
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="CONFIRM"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={confirmInputText}
              onChangeText={setConfirmInputText}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalDeleteBtn,
                  confirmInputText.trim() !== 'CONFIRM' && styles.modalDeleteBtnDisabled
                ]}
                disabled={confirmInputText.trim() !== 'CONFIRM' || isDeleting}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalDeleteText}>
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: ui.spacing.m, paddingBottom: ui.spacing.xs, paddingTop: Platform.OS === 'ios' ? 50 : 20, flexDirection: 'row', alignItems: 'center' },
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
  
  actionButtonsContainer: { marginHorizontal: ui.spacing.m, marginBottom: ui.spacing.xl, gap: 12 },
  logoutBtn: { flexDirection: 'row', height: ui.buttonHeight || 52, backgroundColor: colors.surface, borderRadius: ui.borderRadius, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  logoutText: { ...typography.headline, color: colors.error, marginLeft: 8, fontWeight: '700' },
  
  deleteBtn: { flexDirection: 'row', height: ui.buttonHeight || 52, backgroundColor: 'rgba(255, 77, 77, 0.1)', borderRadius: ui.borderRadius, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FF4D4D' },
  deleteText: { ...typography.headline, color: '#FF4D4D', marginLeft: 8, fontWeight: '700' },
  
  copyrightText: { textAlign: 'center', color: colors.textSecondary, fontSize: 11, marginBottom: 24 },

  // MODAL STYLES FOR DELETE ACCOUNT
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 440, backgroundColor: '#181820', borderRadius: 24, padding: 24, borderWidth: 1.5, borderColor: '#FF4D4D', alignItems: 'center' },
  warningIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,77,77,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  modalSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  modalPrompt: { color: '#FFF', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  capitalTag: { color: '#FF4D4D', fontWeight: '900', letterSpacing: 1 },
  modalInput: { width: '100%', height: 48, backgroundColor: '#22222E', borderRadius: 12, borderWidth: 1.5, borderColor: '#FF4D4D', color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, height: 46, borderRadius: 23, backgroundColor: '#2B2B36', justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  modalDeleteBtn: { flex: 1, height: 46, borderRadius: 23, backgroundColor: '#FF4D4D', justifyContent: 'center', alignItems: 'center' },
  modalDeleteBtnDisabled: { opacity: 0.35, backgroundColor: '#552222' },
  modalDeleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
