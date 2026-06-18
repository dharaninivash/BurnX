import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function NotificationsScreen({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);

  const notifications = useStore((state) => state.notifications);
  const markNotificationsAsRead = useStore((state) => state.markNotificationsAsRead);
  const clearNotifications = useStore((state) => state.clearNotifications);

  React.useEffect(() => {
    markNotificationsAsRead();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={clearNotifications}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No recent notifications</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={styles.notificationCard}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody}>{item.body}</Text>
                <Text style={styles.notifTime}>{item.date}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: 5 },
  headerTitle: { ...typography.title, fontSize: 18 },
  clearText: { color: colors.primary, fontWeight: 'bold' },
  
  content: { padding: 15 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: colors.textSecondary, marginTop: 10 },

  notificationCard: { flexDirection: 'row', backgroundColor: colors.surface, padding: 15, borderRadius: ui.borderRadius, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 122, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  notifBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  notifTime: { fontSize: 10, color: colors.textSecondary, marginTop: 8, alignSelf: 'flex-end' }
});
