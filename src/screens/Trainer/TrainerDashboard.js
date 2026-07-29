import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function TrainerDashboard({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Requests' | 'Clients' | 'Calendar' | 'Reviews'

  // Local Trainer State for real-time interaction
  const [requests, setRequests] = useState([
    { id: 'req_1', clientName: 'Siddharth Rao', goal: 'Muscle Hypertrophy', date: '2026-07-30', time: '10:00 AM', status: 'pending', notes: 'Need help with squat form and lower back discomfort.' },
    { id: 'req_2', clientName: 'Ananya Sharma', goal: 'Cycle-adaptive Weight Loss', date: '2026-07-30', time: '02:00 PM', status: 'pending', notes: 'Entering Luteal phase, want deload advice.' }
  ]);

  const [appointments, setAppointments] = useState([
    { id: 'appt_101', clientName: 'Rahul Verma', status: 'accepted', time: '09:00 AM - 10:00 AM', focus: 'Barbell Bench Press Technique', date: 'Today', roomName: 'room_rahul' },
    { id: 'appt_102', clientName: 'Priya Sharma', status: 'accepted', time: '11:00 AM - 12:00 PM', focus: 'PCOS Nutrition & Cycle Syncing', date: 'Today', roomName: 'room_priya' },
    { id: 'appt_103', clientName: 'Amit Patel', status: 'completed', time: '04:00 PM - 05:00 PM', focus: 'Leg Day Strength Assessment', date: 'Today', roomName: 'room_amit' },
  ]);

  const [clientProfiles] = useState([
    { id: 'c1', name: 'Rahul Verma', age: 27, goal: 'Hypertrophy', weight: '76 kg', streak: 14, attendance: '95%' },
    { id: 'c2', name: 'Priya Sharma', age: 25, goal: 'Cycle Sync & Tone', weight: '58 kg', streak: 21, attendance: '98%' },
    { id: 'c3', name: 'Siddharth Rao', age: 31, goal: 'Strength & Power', weight: '82 kg', streak: 8, attendance: '90%' },
  ]);

  const [reviews] = useState([
    { id: 'r1', client: 'Priya S.', rating: 5, comment: 'Coach Kabir changed my perspective on cycle syncing! High energy sessions.', date: 'Yesterday' },
    { id: 'r2', client: 'Rahul V.', rating: 5, comment: 'My bench press increased by 15kg in 6 weeks. Best trainer on BurnX.', date: '3 days ago' },
  ]);

  const [availability, setAvailability] = useState(['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM']);
  const [newSlot, setNewSlot] = useState('');

  const handleAcceptRequest = (id) => {
    const req = requests.find(r => r.id === id);
    if (req) {
      setRequests(requests.filter(r => r.id !== id));
      setAppointments([
        {
          id: 'appt_' + Date.now(),
          clientName: req.clientName,
          status: 'accepted',
          time: `${req.time} (${req.date})`,
          focus: req.notes || '1-on-1 Personal Coaching',
          date: req.date,
          roomName: `room_${req.id}`
        },
        ...appointments
      ]);
      Alert.alert('Request Accepted', `Session with ${req.clientName} confirmed! Client notified instantly.`);
    }
  };

  const handleRejectRequest = (id) => {
    setRequests(requests.filter(r => r.id !== id));
    Alert.alert('Request Rejected', 'The booking request has been declined.');
  };

  const handleAddSlot = () => {
    if (!newSlot.trim()) return;
    setAvailability([...availability, newSlot.trim()]);
    setNewSlot('');
    Alert.alert('Slot Added', 'New availability slot added to calendar.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Coach {user?.name?.split(' ')[0] || 'Kabir'} 🏆</Text>
          <Text style={styles.subGreeting}>BurnX Certified Trainer Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsRow}>
        {['Overview', 'Requests', 'Clients', 'Calendar', 'Reviews'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <>
            {/* STATS OVERVIEW */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>12</Text>
                <Text style={styles.statLabel}>Active Clients</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{appointments.filter(a => a.status === 'accepted').length}</Text>
                <Text style={styles.statLabel}>Accepted Today</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{requests.length}</Text>
                <Text style={styles.statLabel}>Pending Requests</Text>
              </View>
            </View>

            {/* TODAY'S APPOINTMENTS */}
            <Text style={styles.sectionTitle}>Today's Schedule & Consultations</Text>
            {appointments.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionInfoRow}>
                  <View style={styles.sessionAvatar}>
                    <Text style={styles.avatarText}>{session.clientName[0]}</Text>
                  </View>
                  <View style={styles.sessionDetails}>
                    <Text style={styles.clientName}>{session.clientName}</Text>
                    <Text style={styles.sessionFocus}>{session.focus}</Text>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={13} color={colors.primary} />
                      <Text style={styles.sessionTime}>{session.time}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: session.status === 'completed' ? '#4CAF50' : colors.primary }]}>
                        <Text style={styles.statusBadgeText}>{session.status.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                {session.status === 'accepted' && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                      onPress={() => navigation.navigate('VideoCall', { roomName: session.roomName })}
                    >
                      <Ionicons name="videocam" size={18} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={[styles.actionText, { color: '#FFF' }]}>Join LiveKit Video Session</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* PENDING REQUESTS TAB */}
        {activeTab === 'Requests' && (
          <>
            <Text style={styles.sectionTitle}>Incoming Client Requests ({requests.length})</Text>
            {requests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={48} color={colors.primary} />
                <Text style={styles.emptyText}>No pending appointment requests right now!</Text>
              </View>
            ) : (
              requests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.clientName}>{req.clientName}</Text>
                    <Text style={styles.requestGoal}>{req.goal}</Text>
                  </View>
                  <Text style={styles.requestDetail}>📅 Date: {req.date} at {req.time}</Text>
                  <Text style={styles.requestNotes}>💬 Notes: "{req.notes}"</Text>

                  <View style={styles.reqActionRow}>
                    <TouchableOpacity 
                      style={[styles.reqBtn, { backgroundColor: '#4CAF50' }]}
                      onPress={() => handleAcceptRequest(req.id)}
                    >
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                      <Text style={styles.reqBtnText}>Accept</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.reqBtn, { backgroundColor: '#F44336' }]}
                      onPress={() => handleRejectRequest(req.id)}
                    >
                      <Ionicons name="close" size={18} color="#FFF" />
                      <Text style={styles.reqBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* CLIENT PROFILES TAB */}
        {activeTab === 'Clients' && (
          <>
            <Text style={styles.sectionTitle}>Assigned Client Profiles</Text>
            {clientProfiles.map((client) => (
              <View key={client.id} style={styles.clientProfileCard}>
                <View style={styles.clientHead}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.avatarText}>{client.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.clientSub}>{client.age} yrs • {client.weight} • {client.goal}</Text>
                  </View>
                  <View style={styles.streakTag}>
                    <Ionicons name="flame" size={14} color="#FFF" />
                    <Text style={styles.streakText}>{client.streak}d Streak</Text>
                  </View>
                </View>
                <View style={styles.clientProgressRow}>
                  <Text style={styles.progressLabel}>Session Attendance Rate: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{client.attendance}</Text></Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* AVAILABILITY CALENDAR TAB */}
        {activeTab === 'Calendar' && (
          <>
            <Text style={styles.sectionTitle}>Manage Availability Slots</Text>
            <View style={styles.addSlotCard}>
              <TextInput
                style={styles.slotInput}
                placeholder="Add time slot (e.g. 05:00 PM)"
                placeholderTextColor={colors.textSecondary}
                value={newSlot}
                onChangeText={setNewSlot}
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddSlot}>
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.slotsGrid}>
              {availability.map((slot, index) => (
                <View key={index} style={styles.slotChip}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.slotText}>{slot}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'Reviews' && (
          <>
            <Text style={styles.sectionTitle}>Client Ratings & Reviews (4.9 ⭐)</Text>
            {reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.revHeader}>
                  <Text style={styles.clientName}>{rev.client}</Text>
                  <View style={styles.ratingRow}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Ionicons key={i} name="star" size={14} color="#FFD700" />
                    ))}
                  </View>
                </View>
                <Text style={styles.revComment}>"{rev.comment}"</Text>
                <Text style={styles.revDate}>{rev.date}</Text>
              </View>
            ))}
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
  
  tabsRow: { flexDirection: 'row', paddingHorizontal: 15, marginBottom: 15 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  tabChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  tabTextActive: { color: '#FFF' },

  content: { paddingHorizontal: 15, paddingBottom: 40 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  statBox: { flex: 1, backgroundColor: colors.surface, padding: 14, borderRadius: ui.borderRadius, alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...ui.shadowSm },
  statVal: { fontSize: 24, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 4, fontWeight: '600' },
  
  sectionTitle: { ...typography.title, fontSize: 15, marginBottom: 12, marginTop: 5 },
  
  sessionCard: { backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadius, marginBottom: 12, borderWidth: 1, borderColor: colors.border, ...ui.shadowSm },
  sessionInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sessionAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  sessionDetails: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
  sessionFocus: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  sessionTime: { fontSize: 11, color: colors.primary, fontWeight: 'bold', marginLeft: 4, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 9, color: '#FFF', fontWeight: '900' },

  actionsRow: { flexDirection: 'row' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.primary },
  actionText: { color: colors.primary, fontWeight: 'bold', fontSize: 13 },

  emptyCard: { backgroundColor: colors.surface, padding: 30, borderRadius: ui.borderRadius, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyText: { color: colors.textSecondary, marginTop: 10, fontWeight: '600' },

  requestCard: { backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadius, marginBottom: 12, borderWidth: 1, borderColor: colors.border, ...ui.shadowSm },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  requestGoal: { fontSize: 11, color: colors.primary, fontWeight: 'bold', backgroundColor: 'rgba(255,122,0,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  requestDetail: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  requestNotes: { fontSize: 12, color: colors.textPrimary, fontStyle: 'italic', marginBottom: 12 },
  reqActionRow: { flexDirection: 'row', gap: 10 },
  reqBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  reqBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },

  clientProfileCard: { backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadius, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  clientHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  clientAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  clientSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  streakTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  streakText: { fontSize: 10, color: '#FFF', fontWeight: 'bold', marginLeft: 4 },
  clientProgressRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  progressLabel: { fontSize: 11, color: colors.textSecondary },

  addSlotCard: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  slotInput: { flex: 1, backgroundColor: colors.surface, color: colors.textPrimary, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  addBtn: { backgroundColor: colors.primary, width: 48, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  slotText: { fontSize: 13, fontWeight: 'bold', color: colors.textPrimary },

  reviewCard: { backgroundColor: colors.surface, padding: 16, borderRadius: ui.borderRadius, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  revHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', gap: 2 },
  revComment: { fontSize: 13, color: colors.textPrimary, fontStyle: 'italic', marginBottom: 6 },
  revDate: { fontSize: 10, color: colors.textSecondary }
});
