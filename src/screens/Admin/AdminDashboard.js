import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function AdminDashboard() {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const [activeTab, setActiveTab] = useState('Analytics'); // 'Analytics' | 'Users' | 'Trainers' | 'Plans' | 'AI Usage' | 'Reports'

  // Admin Data State
  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Rahul Verma', email: 'rahul@example.com', plan: 'Premium', status: 'Active', joined: '2026-06-12' },
    { id: 'u2', name: 'Priya Sharma', email: 'priya@example.com', plan: 'Free', status: 'Active', joined: '2026-07-01' },
    { id: 'u3', name: 'Amit Patel', email: 'amit@example.com', plan: 'Premium', status: 'Active', joined: '2026-07-15' },
  ]);

  const [trainersList, setTrainersList] = useState([
    { id: 't1', name: 'Coach Kabir Malhotra', specialty: 'Strength & Conditioning', status: 'Verified', clients: 12 },
    { id: 't2', name: 'Dr. Anjali Sharma', specialty: 'Women Wellness & Cycle Syncing', status: 'Verified', clients: 18 },
    { id: 't3', name: 'Coach Rohan Mehta', specialty: 'Calisthenics & High Intensity', status: 'Pending Approval', clients: 0 },
  ]);

  const [aiLimitSetting, setAiLimitSetting] = useState('5');
  const [plans, setPlans] = useState([
    { id: 'p1', name: 'BurnX Free Tier', price: '₹0 / mo', aiLimit: '5 chats / month', features: 'Basic Workouts, Water Logger, Free AI' },
    { id: 'p2', name: 'BurnX Premium', price: '₹999 / mo', aiLimit: 'Unlimited AI', features: 'Unlimited AI, Video Consultation, Cycle Syncing Pro' },
  ]);

  const handleToggleUserStatus = (id) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
    Alert.alert('Status Updated', 'User account status changed.');
  };

  const handleApproveTrainer = (id) => {
    setTrainersList(trainersList.map(t => t.id === id ? { ...t, status: 'Verified' } : t));
    Alert.alert('Trainer Verified', 'Trainer account approved for client bookings.');
  };

  const handleSaveAiLimit = () => {
    Alert.alert('AI Limit Updated', `Monthly free tier AI Coach limit updated to ${aiLimitSetting} messages per month.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Control Center ⚡</Text>
          <Text style={styles.subGreeting}>BurnX Enterprise Infrastructure Management</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {['Analytics', 'Users', 'Trainers', 'Plans', 'AI Usage', 'Reports'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* ANALYTICS & REVENUE TAB */}
        {activeTab === 'Analytics' && (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>842</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>24</Text>
                <Text style={styles.statLabel}>Active Trainers</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>₹1.2M</Text>
                <Text style={styles.statLabel}>Monthly Revenue</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>128</Text>
                <Text style={styles.statLabel}>Premium Subs</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>System Health & Infrastructure</Text>
            <View style={styles.healthCard}>
              <View style={styles.healthItem}>
                <Ionicons name="server-outline" size={20} color="#4CAF50" />
                <Text style={styles.healthLabel}>LiveKit Cloud WebRTC Stream: <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>OPERATIONAL</Text></Text>
              </View>
              <View style={styles.healthItem}>
                <Ionicons name="card-outline" size={20} color="#4CAF50" />
                <Text style={styles.healthLabel}>Razorpay Payment Gateway: <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>ACTIVE</Text></Text>
              </View>
              <View style={styles.healthItem}>
                <Ionicons name="hardware-chip-outline" size={20} color="#4CAF50" />
                <Text style={styles.healthLabel}>Groq LLM AI Engine: <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>ONLINE</Text></Text>
              </View>
            </View>
          </>
        )}

        {/* USERS MANAGEMENT TAB */}
        {activeTab === 'Users' && (
          <>
            <Text style={styles.sectionTitle}>Manage Registered Users ({usersList.length})</Text>
            {usersList.map((u) => (
              <View key={u.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{u.name}</Text>
                  <View style={[styles.badge, { backgroundColor: u.status === 'Active' ? '#4CAF50' : '#F44336' }]}>
                    <Text style={styles.badgeText}>{u.status}</Text>
                  </View>
                </View>
                <Text style={styles.itemSub}>{u.email} • Joined: {u.joined}</Text>
                <Text style={styles.itemDetail}>Plan: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{u.plan}</Text></Text>
                <TouchableOpacity 
                  style={[styles.actionBtn, { borderColor: u.status === 'Active' ? '#F44336' : '#4CAF50' }]} 
                  onPress={() => handleToggleUserStatus(u.id)}
                >
                  <Text style={[styles.actionBtnText, { color: u.status === 'Active' ? '#F44336' : '#4CAF50' }]}>
                    {u.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* TRAINERS MANAGEMENT TAB */}
        {activeTab === 'Trainers' && (
          <>
            <Text style={styles.sectionTitle}>Manage Certified Trainers ({trainersList.length})</Text>
            {trainersList.map((t) => (
              <View key={t.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{t.name}</Text>
                  <View style={[styles.badge, { backgroundColor: t.status === 'Verified' ? '#4CAF50' : '#FF9800' }]}>
                    <Text style={styles.badgeText}>{t.status}</Text>
                  </View>
                </View>
                <Text style={styles.itemSub}>{t.specialty}</Text>
                <Text style={styles.itemDetail}>Assigned Clients: {t.clients}</Text>
                {t.status !== 'Verified' && (
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveTrainer(t.id)}>
                    <Text style={styles.approveBtnText}>Approve & Verify Trainer</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}

        {/* PLANS MANAGEMENT TAB */}
        {activeTab === 'Plans' && (
          <>
            <Text style={styles.sectionTitle}>Manage Subscription Plans</Text>
            {plans.map((p) => (
              <View key={p.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{p.name}</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary }}>{p.price}</Text>
                </View>
                <Text style={styles.itemSub}>AI Quota: {p.aiLimit}</Text>
                <Text style={styles.itemDetail}>Included: {p.features}</Text>
              </View>
            ))}
          </>
        )}

        {/* AI USAGE LIMITS TAB */}
        {activeTab === 'AI Usage' && (
          <>
            <Text style={styles.sectionTitle}>BurnX AI Coach Monthly Limit Configuration</Text>
            <View style={styles.itemCard}>
              <Text style={styles.itemSub}>Configure maximum free AI messages per user calendar month:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={aiLimitSetting}
                onChangeText={setAiLimitSetting}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAiLimit}>
                <Text style={styles.saveBtnText}>Save AI Rule Settings</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'Reports' && (
          <>
            <Text style={styles.sectionTitle}>System Security & QA Log Reports</Text>
            <View style={styles.itemCard}>
              <Text style={styles.itemTitle}>🔒 HMAC Payment Signature Verification</Text>
              <Text style={styles.itemSub}>100% Passed. Frontend payments validated exclusively on backend.</Text>
            </View>
            <View style={styles.itemCard}>
              <Text style={styles.itemTitle}>🎥 LiveKit Token Server Audit</Text>
              <Text style={styles.itemSub}>JWT token TTL set to 1 hour with room-specific grants.</Text>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginVertical: 10 },
  greeting: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  subGreeting: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  iconBtn: { padding: 8, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  
  tabsRow: { flexDirection: 'row', paddingHorizontal: 15, marginBottom: 15, maxHeight: 40 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  tabChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  tabTextActive: { color: '#FFF' },

  content: { paddingHorizontal: 15, paddingBottom: 40 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 10 },
  statBox: { flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadius, alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...ui.shadowSm },
  statVal: { fontSize: 24, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, fontWeight: '600' },
  
  sectionTitle: { ...typography.title, fontSize: 15, marginBottom: 12, marginTop: 10 },
  
  healthCard: { backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadius, borderWidth: 1, borderColor: colors.border, gap: 12 },
  healthItem: { flexDirection: 'row', alignItems: 'center' },
  healthLabel: { fontSize: 12, color: colors.textPrimary, marginLeft: 10 },

  itemCard: { backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadius, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
  itemSub: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  itemDetail: { fontSize: 12, color: colors.textPrimary, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, color: '#FFF', fontWeight: 'bold' },
  
  actionBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: 'bold' },
  approveBtn: { marginTop: 10, backgroundColor: '#4CAF50', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  approveBtnText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },

  input: { backgroundColor: colors.background, color: colors.textPrimary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginTop: 10, fontSize: 16, fontWeight: 'bold' },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
