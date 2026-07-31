import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function Progress({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const user = useStore((state) => state.user) || { weight: 70 };
  const completedWorkouts = useStore((state) => state.completedWorkouts) || [];
  const workoutLogs = useStore((state) => state.workoutLogs) || [];
  const activeStreak = useStore((state) => state.activeStreak) || 1;
  const achievements = useStore((state) => state.achievements) || [];
  const readinessScore = useStore((state) => state.readinessScore) || 75;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Generate data for custom chart based on the most logged exercise
  let chartExercise = 'Bench Press'; // fallback
  let chartData = [];
  if (workoutLogs.length > 0) {
    // find most common exercise
    const counts = {};
    workoutLogs.forEach(log => counts[log.exerciseName] = (counts[log.exerciseName] || 0) + 1);
    chartExercise = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    
    // get logs for this exercise, chronological
    const exLogs = workoutLogs.filter(l => l.exerciseName === chartExercise).reverse().slice(-7); // max 7 bars
    if (exLogs.length > 0) {
      const maxWeight = Math.max(...exLogs.map(l => l.weight), 10); // avoid div by 0
      chartData = exLogs.map(l => ({
        ...l,
        heightPercent: (l.weight / maxWeight) * 100
      }));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.header}>PROGRESS</Text>
          <Text style={styles.headerSub}>Dynamic Analytics & Performance Logs</Text>
        </View>

        {/* 1. PERFORMANCE SUMMARY */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Diagnostic Ratios</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{activeStreak}d</Text>
              <Text style={styles.statLabel}>ACTIVE STREAK</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{completedWorkouts.length}</Text>
              <Text style={styles.statLabel}>WORKOUTS LOGGED</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{unlockedCount}/{achievements.length}</Text>
              <Text style={styles.statLabel}>BADGES</Text>
            </View>
          </View>
        </View>

        {/* 2. WEIGHT TREND */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bodyweight Analytics</Text>
          <View style={styles.weightTrendRow}>
            <View style={styles.weightDisplay}>
              <Text style={styles.weightNum}>{user?.weight} kg</Text>
              <Text style={styles.weightSub}>CURRENT PORTION BASE</Text>
            </View>
            
            <View style={styles.trendInfoCol}>
              <View style={styles.trendStat}>
                <Ionicons name="trending-down" size={20} color={colors.success} />
                <Text style={styles.trendText}>Stable Caloric Equilibrium</Text>
              </View>
              <Text style={styles.trendAdvice}>Weight is utilized to calibrate optimal daily BMR equations.</Text>
            </View>
          </View>
        </View>

        {/* 2.5 WEIGHT PROGRESS CHART (CUSTOM) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{chartExercise} Progress</Text>
          {chartData.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginVertical: 20 }}>Log sets during your workout to see weight progression here.</Text>
          ) : (
            <View style={styles.chartContainer}>
              {chartData.map((dataPoint, index) => (
                <View key={index} style={styles.barWrapper}>
                  <Text style={styles.barLabelTop}>{dataPoint.weight}kg</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${dataPoint.heightPercent}%` }]} />
                  </View>
                  <Text style={styles.barLabelBottom}>{dataPoint.reps}r</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 3. RECOVERY METRIC DIAGNOSTIC */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CNS Readiness History</Text>
          <View style={styles.readinessProgressRow}>
            <View style={styles.readinessBarBg}>
              <View style={[styles.readinessBarFill, { width: `${readinessScore}%` }]} />
            </View>
            <Text style={styles.readinessScoreText}>{readinessScore}% Score</Text>
          </View>
          <Text style={styles.readinessPara}>Central Nervous System readiness index aggregates sleep logs, logged mood points, and biological cycle phases.</Text>
        </View>

        {/* 4. RECENT WORKOUTS HISTORY */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completed Splits History</Text>
          {completedWorkouts.length === 0 ? (
            <View style={styles.emptyWorkouts}>
              <Ionicons name="barbell-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyWorkoutsText}>No completed workouts logged yet.</Text>
            </View>
          ) : (
            <View style={styles.workoutList}>
              {completedWorkouts.map((workout) => (
                <View key={workout.id} style={styles.workoutItem}>
                  <View style={styles.workoutItemLeft}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.workoutItemName}>{workout.name}</Text>
                      <Text style={styles.workoutItemMeta}>{workout.date} • {workout.exercisesCount} Exercises</Text>
                    </View>
                  </View>
                  <Text style={styles.workoutDuration}>{workout.duration}m</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 5. LEADERBOARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BurnX Leaderboard</Text>
          <View style={styles.leaderboardRow}>
            <Text style={styles.rankText}>1</Text>
            <Ionicons name="person-circle" size={32} color={colors.primary} style={{ marginHorizontal: 10 }} />
            <Text style={styles.leaderboardName}>Coach Kabir Malhotra</Text>
            <Text style={styles.leaderboardPoints}>14,800 pts</Text>
          </View>
          <View style={[styles.leaderboardRow, styles.leaderboardSelf]}>
            <Text style={[styles.rankText, { color: colors.textPrimary }]}>2</Text>
            <Ionicons name="person-circle" size={32} color="#FFF" style={{ marginHorizontal: 10 }} />
            <Text style={[styles.leaderboardName, { color: colors.textPrimary, fontWeight: 'bold' }]}>You</Text>
            <Text style={[styles.leaderboardPoints, { color: colors.textPrimary }]}>{completedWorkouts.length * 100 + activeStreak * 50} pts</Text>
          </View>
          <View style={styles.leaderboardRow}>
            <Text style={styles.rankText}>3</Text>
            <Ionicons name="person-circle" size={32} color={colors.primary} style={{ marginHorizontal: 10 }} />
            <Text style={styles.leaderboardName}>Dr. Anjali Sharma</Text>
            <Text style={styles.leaderboardPoints}>8,600 pts</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: ui.spacing.m, paddingBottom: ui.spacing.xxl },
  
  headerContainer: { marginBottom: ui.spacing.l, paddingTop: ui.spacing.s },
  header: { ...typography.largeTitle, color: colors.primary, letterSpacing: 1 },
  headerSub: { ...typography.subhead, color: colors.textSecondary, marginTop: 4 },

  card: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: ui.spacing.l, marginBottom: ui.spacing.l, borderWidth: 1, borderColor: colors.border, ...ui.shadowLg },
  cardTitle: { ...typography.headline, marginBottom: ui.spacing.m },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: ui.spacing.s },
  statBox: { flex: 1, backgroundColor: colors.surfaceSecondary, padding: ui.spacing.m, borderRadius: ui.borderRadiusSm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statVal: { ...typography.title, color: colors.primary },
  statLabel: { ...typography.caption, fontSize: 9, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },

  weightTrendRow: { flexDirection: 'row', alignItems: 'center', gap: ui.spacing.m },
  weightDisplay: { backgroundColor: colors.surfaceSecondary, padding: ui.spacing.m, borderRadius: ui.borderRadiusSm, alignItems: 'center', width: 120, borderWidth: 1, borderColor: colors.border },
  weightNum: { ...typography.title, color: colors.textPrimary },
  weightSub: { ...typography.caption, fontSize: 8, color: colors.textSecondary, marginTop: 4 },
  trendInfoCol: { flex: 1 },
  trendStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trendText: { ...typography.subhead, fontWeight: '700', color: colors.success },
  trendAdvice: { ...typography.caption, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },

  readinessProgressRow: { flexDirection: 'row', alignItems: 'center', gap: ui.spacing.m, marginVertical: ui.spacing.s },
  readinessBarBg: { flex: 1, height: 8, backgroundColor: colors.surfaceSecondary, borderRadius: 4, overflow: 'hidden' },
  readinessBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  readinessScoreText: { ...typography.subhead, fontWeight: '700', color: colors.primary },
  readinessPara: { ...typography.caption, color: colors.textSecondary, lineHeight: 18, marginTop: 6 },

  emptyWorkouts: { alignItems: 'center', paddingVertical: ui.spacing.xl, gap: ui.spacing.s },
  emptyWorkoutsText: { ...typography.subhead, color: colors.textSecondary },
  workoutList: { gap: ui.spacing.m },
  workoutItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceSecondary, padding: ui.spacing.m, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border },
  workoutItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  workoutItemName: { ...typography.subhead, fontWeight: '700', color: colors.textPrimary },
  workoutItemMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  workoutDuration: { ...typography.subhead, fontWeight: '700', color: colors.primary },

  leaderboardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: ui.spacing.s, borderBottomWidth: 1, borderBottomColor: colors.border },
  leaderboardSelf: { backgroundColor: 'rgba(255,122,0,0.15)', borderRadius: ui.borderRadiusSm, paddingHorizontal: ui.spacing.s, borderBottomWidth: 0 },
  rankText: { ...typography.subhead, fontWeight: '700', color: colors.textSecondary, width: 20, textAlign: 'center' },
  leaderboardName: { ...typography.subhead, color: colors.textSecondary, flex: 1 },
  leaderboardPoints: { ...typography.subhead, fontWeight: '700', color: colors.primary },

  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 180, paddingTop: ui.spacing.m, paddingBottom: ui.spacing.s },
  barWrapper: { alignItems: 'center', flex: 1 },
  barTrack: { height: 120, width: 24, backgroundColor: colors.surfaceSecondary, borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden', marginVertical: 8, borderWidth: 1, borderColor: colors.border },
  barFill: { width: '100%', backgroundColor: colors.primary, borderRadius: 12 },
  barLabelTop: { ...typography.caption, fontSize: 10, fontWeight: '700', color: colors.textPrimary },
  barLabelBottom: { ...typography.caption, fontSize: 9, color: colors.textSecondary }
});
