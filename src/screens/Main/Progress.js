import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.header}>PROGRESS AXIS</Text>
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
          <Text style={styles.cardTitle}>FitAxis Leaderboard</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 15, paddingBottom: 40 },
  
  header: { ...typography.header, color: colors.primary, fontSize: 22, fontWeight: '900', paddingTop: 10 },
  headerSub: { ...typography.caption, color: colors.textSecondary, marginTop: -2, marginBottom: 20 },

  card: { backgroundColor: colors.surface, borderRadius: ui.borderRadius, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  cardTitle: { ...typography.title, fontSize: 16, marginBottom: 15 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  statBox: { flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 12, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: 8, fontWeight: 'bold', color: colors.textSecondary, marginTop: 4, textAlign: 'center' },

  weightTrendRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  weightDisplay: { backgroundColor: colors.background, padding: 15, borderRadius: 12, alignItems: 'center', width: 120 },
  weightNum: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  weightSub: { fontSize: 7, fontWeight: 'bold', color: colors.textSecondary, marginTop: 4 },
  trendInfoCol: { flex: 1 },
  trendStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trendText: { fontSize: 13, fontWeight: 'bold', color: colors.success },
  trendAdvice: { fontSize: 11, color: colors.textSecondary, marginTop: 4, lineHeight: 16 },

  readinessProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  readinessBarBg: { flex: 1, height: 6, backgroundColor: colors.background, borderRadius: 3, overflow: 'hidden' },
  readinessBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  readinessScoreText: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
  readinessPara: { fontSize: 11, color: colors.textSecondary, lineHeight: 16, marginTop: 6 },

  emptyWorkouts: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyWorkoutsText: { fontSize: 12, color: colors.textSecondary },
  workoutList: { gap: 10 },
  workoutItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  workoutItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  workoutItemName: { fontSize: 13, fontWeight: 'bold', color: colors.textPrimary },
  workoutItemMeta: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  workoutDuration: { fontSize: 12, fontWeight: 'bold', color: colors.primary },

  leaderboardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  leaderboardSelf: { backgroundColor: 'rgba(255,122,0,0.15)', borderRadius: 10, paddingHorizontal: 8, borderBottomWidth: 0 },
  rankText: { fontSize: 12, fontWeight: 'bold', color: colors.textSecondary, width: 15, textAlign: 'center' },
  leaderboardName: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  leaderboardPoints: { fontSize: 12, fontWeight: 'bold', color: colors.primary },

  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 180, paddingTop: 20, paddingBottom: 10 },
  barWrapper: { alignItems: 'center', flex: 1 },
  barTrack: { height: 120, width: 24, backgroundColor: colors.background, borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden', marginVertical: 8 },
  barFill: { width: '100%', backgroundColor: colors.primary, borderRadius: 12 },
  barLabelTop: { fontSize: 10, fontWeight: 'bold', color: colors.textPrimary },
  barLabelBottom: { fontSize: 9, color: colors.textSecondary }
});
