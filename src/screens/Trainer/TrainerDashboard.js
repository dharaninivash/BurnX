import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function TrainerDashboard() {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Coach {user?.name?.split(' ')[0]} 🏆</Text>
          <Text style={styles.subGreeting}>FitAxis Certified Trainer Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* STATS OVERVIEW */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>12</Text>
            <Text style={styles.statLabel}>Active Clients</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>4</Text>
            <Text style={styles.statLabel}>Sessions Today</Text>
          </View>
        </View>

        {/* SCHEDULE */}
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {[
          { time: '09:00 AM - 10:00 AM', name: 'Rahul Verma', focus: 'Strength Training (Squat check)', avatar: 'R' },
          { time: '11:00 AM - 12:00 PM', name: 'Priya Sharma', focus: 'Cycle-adaptive Mobility (Menstruation deload)', avatar: 'P' },
          { time: '04:00 PM - 05:00 PM', name: 'Amit Patel', focus: 'Hypertrophy (Chest & Shoulders)', avatar: 'A' },
        ].map((session, idx) => (
          <View key={idx} style={styles.sessionCard}>
            <View style={styles.sessionInfoRow}>
              <View style={styles.sessionAvatar}>
                <Text style={styles.avatarText}>{session.avatar}</Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.clientName}>{session.name}</Text>
                <Text style={styles.sessionFocus}>{session.focus}</Text>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={13} color={colors.primary} />
                  <Text style={styles.sessionTime}>{session.time}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.actionText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                <Ionicons name="videocam-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={[styles.actionText, { color: '#FFF' }]}>Start Stream</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 45 : 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '900', color: colors.textPrimary },
  subGreeting: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  iconBtn: { padding: 8, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  
  content: { paddingHorizontal: 15, paddingBottom: 40 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, gap: 10 },
  statBox: { flex: 1, backgroundColor: colors.surface, padding: 18, borderRadius: ui.borderRadius, alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  statVal: { fontSize: 32, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, fontWeight: '600' },
  
  sectionTitle: { ...typography.title, fontSize: 16, marginBottom: 15 },
  
  sessionCard: { backgroundColor: colors.surface, padding: 18, borderRadius: ui.borderRadius, marginBottom: 15, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  sessionInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sessionAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginRight: 15 },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  sessionDetails: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
  sessionFocus: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  sessionTime: { fontSize: 10, color: colors.primary, fontWeight: 'bold', marginLeft: 4 },
  
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.primary },
  actionText: { color: colors.primary, fontWeight: 'bold', fontSize: 13 }
});
