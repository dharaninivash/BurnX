import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import RazorpayCheckoutModal from '../../components/RazorpayCheckoutModal';
import { createRazorpayOrder } from '../../services/razorpayService';
import { useTheme } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function Home({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const user = useStore((state) => state.user) || { name: 'Athlete', gender: 'Male', streak: 5 };
  const calorieTarget = useStore((state) => state.calorieTarget) || 2000;
  const macroTarget = useStore((state) => state.macroTarget) || { protein: 120, carbs: 200, fats: 60 };
  
  const caloriesConsumed = useStore((state) => state.caloriesConsumed) || 0;
  const loggedFoods = useStore((state) => state.loggedFoods) || [];
  
  const waterIntake = useStore((state) => state.waterIntake) || 0;
  const waterIntakeGoal = useStore((state) => state.waterIntakeGoal) || 3000;
  const addWater = useStore((state) => state.addWater);
  const resetWater = useStore((state) => state.resetWater);

  const activeStreak = useStore((state) => state.activeStreak) || 1;
  const readinessScore = useStore((state) => state.readinessScore) || 75;
  const sleepHours = useStore((state) => state.sleepHours) || 7.5;
  const currentMood = useStore((state) => state.currentMood) || 'Calm';
  const achievements = useStore((state) => state.achievements) || [];
  
  const notifications = useStore((state) => state.notifications) || [];
  const markNotificationsAsRead = useStore((state) => state.markNotificationsAsRead);
  const clearNotifications = useStore((state) => state.clearNotifications);

  const lastPeriodDate = useStore((state) => state.lastPeriodDate);
  const cycleLength = useStore((state) => state.cycleLength) || 28;

  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [trainerModalVisible, setTrainerModalVisible] = useState(false);
  
  const isPremium = useStore((state) => state.isPremium);
  const unlockPremium = useStore((state) => state.unlockPremium);

  const handlePremiumFeatureClick = async (route) => {
    if (isPremium) {
      navigation.navigate(route);
    } else {
      const orderId = await createRazorpayOrder(199900);
      setCurrentOrderId(orderId);
      setCheckoutVisible(true);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setCheckoutVisible(false);
    try {
      const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${backendUrl}/api/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature
        })
      });
    } catch (err) {
      if (__DEV__) console.log('Verification network notice, proceeding with client unlock.');
    } finally {
      unlockPremium();
      Alert.alert('🎉 Premium Unlocked!', 'Welcome to BurnX Premium! Your membership is active.');
    }
  };

  // Sum logged macros
  const proteinConsumed = loggedFoods.reduce((acc, curr) => acc + (curr.protein || 0), 0);
  const carbsConsumed = loggedFoods.reduce((acc, curr) => acc + (curr.carbs || 0), 0);
  const fatsConsumed = loggedFoods.reduce((acc, curr) => acc + (curr.fats || 0), 0);

  const exerciseBurned = 350; // Standard baseline exercise burn estimation
  const netCalories = caloriesConsumed - exerciseBurned;
  const remainingCalories = calorieTarget - caloriesConsumed;

  // Unread notification count
  const unreadNotifs = notifications.filter(n => !n.read).length;

  // Dynamic Menstrual Cycle Calculation
  let cyclePhase = 'N/A';
  let daysUntilNext = 28;
  let phaseAdvice = 'Maintain your regular training split and push hard.';
  
  if (user?.gender === 'Female' && lastPeriodDate) {
    const lastDate = new Date(lastPeriodDate);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
    const cycleDay = diffDays % cycleLength;
    
    if (cycleDay >= 0 && cycleDay <= 5) {
      cyclePhase = 'Menstruation (Day 1-5)';
      daysUntilNext = cycleLength - cycleDay;
      phaseAdvice = '🔴 Energy levels are low. Focus on gentle recovery, yoga, or light dumbbell sessions.';
    } else if (cycleDay > 5 && cycleDay <= 13) {
      cyclePhase = 'Follicular Phase (Day 6-13)';
      daysUntilNext = cycleLength - cycleDay;
      phaseAdvice = '⚡ Estrogen is rising! Perfect time to increase hypertrophy weights and push sets.';
    } else if (cycleDay >= 14 && cycleDay <= 15) {
      cyclePhase = 'Ovulation (Day 14-15)';
      daysUntilNext = cycleLength - cycleDay;
      phaseAdvice = '🔥 Peak strength and energy! Ideal day to attempt a personal record (PR) on squats or presses.';
    } else {
      cyclePhase = 'Luteal Phase (Day 16-28)';
      daysUntilNext = cycleLength - cycleDay;
      phaseAdvice = '🧘 Energy is tapering down. Switch to moderate weights, higher reps, or aerobic conditioning.';
    }
  }

  const openNotifModal = () => {
    setNotifModalVisible(true);
    markNotificationsAsRead();
  };

  const logQuickWater = (ml) => {
    addWater(ml);
  };

  // Readiness dynamic description
  let readinessDescription = 'Good recovery';
  let readinessSub = 'Focus on consistency today.';
  if (readinessScore >= 85) {
    readinessDescription = 'Optimal Conditioning';
    readinessSub = 'Your body is primed for maximum physical output! Go heavy.';
  } else if (readinessScore < 60) {
    readinessDescription = 'Fatigue Warning';
    readinessSub = 'Central nervous system recovery is low. Consider a recovery walk or extra sleep.';
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* TOP STATUS BAR */}
        <View style={styles.topHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.greetingText}>HELLO,</Text>
              <Text style={styles.nameText}>{user?.name?.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.topRightControls}>
            {/* Streak Counter */}
            <View style={styles.streakIndicator}>
              <Ionicons name="flame" size={20} color={colors.primary} />
              <Text style={styles.streakText}>{activeStreak}d</Text>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity style={styles.iconBtn} onPress={openNotifModal}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              {unreadNotifs > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. READINESS SCORE */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessRow}>
            {/* Massive Circular Dial */}
            <View style={styles.readinessDial}>
              <Text style={styles.readinessScoreNum}>{readinessScore}</Text>
              <Text style={styles.readinessScoreLabel}>READINESS</Text>
            </View>
            
            <View style={styles.readinessDetails}>
              <Text style={styles.readinessTitle}>{readinessDescription}</Text>
              <Text style={styles.readinessDesc}>{readinessSub}</Text>
              <View style={styles.readinessFactorsRow}>
                <View style={styles.factorTag}>
                  <Ionicons name="moon-outline" size={13} color="#8B5CF6" />
                  <Text style={styles.factorTagText}>{sleepHours}h sleep</Text>
                </View>
                <View style={styles.factorTag}>
                  <Ionicons name="happy-outline" size={13} color={colors.primary} />
                  <Text style={styles.factorTagText}>{currentMood}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. CALORIES MAIN CARD (MyFitnessPal Style but premium) */}
        <View style={styles.caloriesCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Estimated Energy Expenditure</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Nutrition')}>
              <Ionicons name="add-circle" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Math Layout */}
          <View style={styles.equationRow}>
            <View style={styles.eqBox}>
              <Text style={styles.eqVal}>{calorieTarget}</Text>
              <Text style={styles.eqLabel}>Base Goal</Text>
            </View>
            <Text style={styles.operator}>-</Text>
            <View style={styles.eqBox}>
              <Text style={styles.eqVal}>{caloriesConsumed}</Text>
              <Text style={styles.eqLabel}>Food Logged</Text>
            </View>
            <Text style={styles.operator}>+</Text>
            <View style={styles.eqBox}>
              <Text style={styles.eqVal}>{exerciseBurned}</Text>
              <Text style={styles.eqLabel}>Est. Exercise</Text>
            </View>
            <Text style={styles.operator}>=</Text>
            <View style={styles.eqBox}>
              <Text style={[styles.eqVal, { color: remainingCalories >= 0 ? colors.success : colors.error }]}>
                {remainingCalories}
              </Text>
              <Text style={styles.eqLabel}>Net Left</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBg}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(100, (caloriesConsumed / calorieTarget) * 100)}%`,
                  backgroundColor: caloriesConsumed > calorieTarget ? colors.error : colors.primary
                }
              ]} 
            />
          </View>
        </View>

        {/* 3. MACROS RATIOS */}
        <View style={styles.macrosCard}>
          <Text style={styles.macroTitleText}>Macronutrient Breakdown</Text>
          
          <View style={styles.macroProgressBarRow}>
            {/* Protein */}
            <View style={styles.macroProgressItem}>
              <View style={styles.macroItemHeader}>
                <Text style={styles.macroItemLabel}>Protein</Text>
                <Text style={styles.macroItemVals}>{proteinConsumed}g / {macroTarget.protein}g</Text>
              </View>
              <View style={styles.macroBarBg}>
                <View style={[styles.macroBarFill, { width: `${Math.min(100, (proteinConsumed / macroTarget.protein) * 100)}%`, backgroundColor: colors.primary }]} />
              </View>
            </View>

            {/* Carbs */}
            <View style={styles.macroProgressItem}>
              <View style={styles.macroItemHeader}>
                <Text style={styles.macroItemLabel}>Carbs</Text>
                <Text style={styles.macroItemVals}>{carbsConsumed}g / {macroTarget.carbs}g</Text>
              </View>
              <View style={styles.macroBarBg}>
                <View style={[styles.macroBarFill, { width: `${Math.min(100, (carbsConsumed / macroTarget.carbs) * 100)}%`, backgroundColor: '#FFC107' }]} />
              </View>
            </View>

            {/* Fats */}
            <View style={styles.macroProgressItem}>
              <View style={styles.macroItemHeader}>
                <Text style={styles.macroItemLabel}>Fats</Text>
                <Text style={styles.macroItemVals}>{fatsConsumed}g / {macroTarget.fats}g</Text>
              </View>
              <View style={styles.macroBarBg}>
                <View style={[styles.macroBarFill, { width: `${Math.min(100, (fatsConsumed / macroTarget.fats) * 100)}%`, backgroundColor: '#E91E63' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* 4. QUICK ACTION BAR */}
        <View style={styles.quickBar}>
          <Text style={styles.sectionTitle}>BurnX Launchers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            <TouchableOpacity style={styles.actionCard} onPress={() => handlePremiumFeatureClick('Chatbot')}>
              <Ionicons name="hardware-chip-outline" size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>BurnX Coach {!isPremium && <Ionicons name="lock-closed" size={10} color={colors.textSecondary} />}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Workout')}>
              <Ionicons name="barbell-outline" size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>Generators</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => setTrainerModalVisible(true)}>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>Book Trainer</Text>
              <View style={{ backgroundColor: 'rgba(233, 30, 99, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4 }}>
                <Text style={{ color: colors.primary, fontSize: 9, fontWeight: 'bold' }}>COMING SOON</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('CalendarScreen')}>
              <Ionicons name="flower-outline" size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>Wellness Hub</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 5. WOMEN CYCLE SYNC INSIGHTS (Shown conditionally for female users) */}
        {user?.gender === 'Female' && (
          <TouchableOpacity style={styles.cycleSyncCard} onPress={() => navigation.navigate('CalendarScreen')}>
            <View style={styles.cycleRow}>
              <Ionicons name="flower" size={28} color="#E91E63" />
              <View style={styles.cycleTextCol}>
                <View style={styles.cycleHeaderRow}>
                  <Text style={styles.cyclePhaseTitle}>{cyclePhase}</Text>
                  <Text style={styles.daysBadge}>{daysUntilNext} days left</Text>
                </View>
                <Text style={styles.cycleAdviceText}>{phaseAdvice}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* 6. HYDRATION TRACKER (Sleek Sky Blue themed card) */}
        <View style={styles.waterCard}>
          <View style={styles.waterHeaderRow}>
            <View>
              <Text style={styles.waterTitle}>Water Hydration</Text>
              <Text style={styles.waterSub}>{waterIntake}ml logged / {waterIntakeGoal}ml Goal</Text>
            </View>
            <TouchableOpacity onPress={resetWater} style={styles.resetBtn}>
              <Ionicons name="refresh-outline" size={16} color="#0EA5E9" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.waterProgressRow}>
            <View style={styles.waterGaugeBg}>
              <View style={[styles.waterGaugeFill, { width: `${Math.min(100, (waterIntake / waterIntakeGoal) * 100)}%` }]} />
            </View>
          </View>

          <View style={styles.waterQuickBtnsRow}>
            <TouchableOpacity style={styles.waterQuickBtn} onPress={() => logQuickWater(250)}>
              <Ionicons name="water-outline" size={16} color="#FFF" />
              <Text style={styles.waterQuickBtnText}>+250ml Glass</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterQuickBtn} onPress={() => logQuickWater(500)}>
              <Ionicons name="water" size={16} color="#FFF" />
              <Text style={styles.waterQuickBtnText}>+500ml Shaker</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.waterQuickBtn, { backgroundColor: '#0ea5e920', borderWidth: 1, borderColor: '#0EA5E9' }]} onPress={() => logQuickWater(1000)}>
              <Ionicons name="cube-outline" size={16} color="#0EA5E9" />
              <Text style={[styles.waterQuickBtnText, { color: '#0EA5E9' }]}>+1.0L Bottle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. RECENT ACHIEVEMENTS */}
        <View style={styles.achievementsCard}>
          <Text style={styles.sectionTitle}>Your Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achScroll}>
            {achievements.map((ach) => (
              <View key={ach.id} style={[styles.achBadge, ach.unlocked && styles.achBadgeUnlocked]}>
                <Ionicons name={ach.icon} size={28} color={ach.unlocked ? colors.textPrimary : '#444'} />
                <Text style={[styles.achBadgeTitle, ach.unlocked && { color: colors.textPrimary }]}>{ach.title}</Text>
                <Text style={styles.achBadgeStatus}>{ach.unlocked ? 'UNLOCKED' : 'LOCKED'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* NOTIFICATIONS MODAL OVERLAY */}
      <Modal visible={notifModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>BurnX Alerts</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
              <View style={styles.emptyNotifs}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyNotifsText}>Your notification inbox is currently clear.</Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }}>
                {notifications.map((notif) => (
                  <View key={notif.id} style={styles.notifItem}>
                    <View style={styles.notifDotActive} />
                    <View style={styles.notifTextCol}>
                      <Text style={styles.notifItemTitle}>{notif.title}</Text>
                      <Text style={styles.notifItemBody}>{notif.body}</Text>
                      <Text style={styles.notifItemDate}>{notif.date}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.clearBtn} onPress={() => { clearNotifications(); setNotifModalVisible(false); }}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TRAINER CONSULTATION COMING SOON MODAL */}
      <Modal visible={trainerModalVisible} transparent animationType="fade" onRequestClose={() => setTrainerModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 340, backgroundColor: colors.surface, borderRadius: 20, padding: 24, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: colors.primary, elevation: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>Trainer Consultation</Text>
            
            <View style={{ backgroundColor: 'rgba(233, 30, 99, 0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.primary }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: 'bold' }}>🚀 Coming Soon</Text>
            </View>

            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 20 }}>
              Live video consultation with certified trainers is currently under development.{"\n\n"}
              This feature will be available in a future update.{"\n\n"}
              Thank you for your patience.
            </Text>

            <TouchableOpacity 
              style={{ backgroundColor: colors.primary, width: '100%', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }} 
              onPress={() => setTrainerModalVisible(false)}
            >
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RAZORPAY CHECKOUT */}
      {currentOrderId && (
        <RazorpayCheckoutModal
          visible={checkoutVisible}
          orderId={currentOrderId}
          amount={199900}
          onClose={() => setCheckoutVisible(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: ui.spacing.m, paddingBottom: ui.spacing.xxl },
  
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.l, paddingTop: ui.spacing.s },
  greetingText: { ...typography.footnote, color: colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase' },
  nameText: { ...typography.largeTitle, color: colors.textPrimary, marginTop: -2 },
  
  topRightControls: { flexDirection: 'row', alignItems: 'center' },
  streakIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, paddingHorizontal: ui.spacing.s, paddingVertical: 6, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, marginRight: ui.spacing.s },
  streakText: { ...typography.footnote, color: colors.primary, fontWeight: '700', marginLeft: 4 },
  iconBtn: { backgroundColor: colors.surfaceSecondary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },

  readinessCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: ui.spacing.l, marginBottom: ui.spacing.l, borderLeftWidth: 4, borderLeftColor: colors.primary, ...ui.shadowLg },
  readinessRow: { flexDirection: 'row', alignItems: 'center' },
  readinessDial: { width: 90, height: 90, borderRadius: 45, borderWidth: 8, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: ui.spacing.m, ...ui.shadowSm },
  readinessScoreNum: { ...typography.largeTitle, color: colors.textPrimary },
  readinessScoreLabel: { ...typography.caption, fontSize: 9, color: colors.textSecondary, letterSpacing: 0.5 },
  readinessDetails: { flex: 1 },
  readinessTitle: { ...typography.title, color: colors.textPrimary },
  readinessDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  readinessFactorsRow: { flexDirection: 'row', marginTop: ui.spacing.s },
  factorTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  factorTagText: { ...typography.caption, fontSize: 10, color: colors.textSecondary, marginLeft: 4 },

  caloriesCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: ui.spacing.l, marginBottom: ui.spacing.l, ...ui.shadowLg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.m },
  cardTitle: { ...typography.headline },
  equationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.m },
  eqBox: { alignItems: 'center', width: '22%' },
  eqVal: { ...typography.title },
  eqLabel: { ...typography.caption, fontSize: 10, marginTop: 2, color: colors.textSecondary },
  operator: { ...typography.title, color: colors.textSecondary },
  progressBg: { width: '100%', height: 8, backgroundColor: colors.surfaceSecondary, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  macrosCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: ui.spacing.l, marginBottom: ui.spacing.l, ...ui.shadowLg },
  macroTitleText: { ...typography.headline, marginBottom: ui.spacing.m },
  macroProgressBarRow: { gap: ui.spacing.m },
  macroProgressItem: {},
  macroItemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  macroItemLabel: { ...typography.subhead, color: colors.textPrimary, fontWeight: '700' },
  macroItemVals: { ...typography.caption, color: colors.textSecondary },
  macroBarBg: { width: '100%', height: 6, backgroundColor: colors.surfaceSecondary, borderRadius: 3 },
  macroBarFill: { height: '100%', borderRadius: 3 },

  quickBar: { marginBottom: ui.spacing.l },
  sectionTitle: { ...typography.headline, marginBottom: ui.spacing.s },
  quickScroll: { flexDirection: 'row' },
  actionCard: { backgroundColor: colors.surface, width: 90, height: 90, borderRadius: ui.borderRadius, justifyContent: 'center', alignItems: 'center', marginRight: ui.spacing.m, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  actionLabel: { ...typography.caption, color: colors.textPrimary, fontWeight: '700', marginTop: 8 },

  cycleSyncCard: { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#E91E63', padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, marginBottom: ui.spacing.l, ...ui.shadowLg },
  cycleRow: { flexDirection: 'row', alignItems: 'center' },
  cycleTextCol: { flex: 1, marginLeft: ui.spacing.m },
  cycleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cyclePhaseTitle: { ...typography.subhead, fontWeight: '700', color: '#E91E63' },
  daysBadge: { ...typography.caption, fontSize: 10, color: '#FFF', backgroundColor: '#E91E63', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  cycleAdviceText: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },

  waterCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: ui.spacing.l, marginBottom: ui.spacing.l, ...ui.shadowLg },
  waterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.m },
  waterTitle: { ...typography.subhead, fontWeight: '700', color: '#0EA5E9' },
  waterSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  resetBtn: { padding: ui.spacing.xs },
  waterProgressRow: { marginBottom: ui.spacing.m },
  waterGaugeBg: { width: '100%', height: 8, backgroundColor: colors.surfaceSecondary, borderRadius: 4, overflow: 'hidden' },
  waterGaugeFill: { height: '100%', backgroundColor: '#0EA5E9', borderRadius: 4 },
  waterQuickBtnsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: ui.spacing.s },
  waterQuickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0EA5E9', paddingVertical: ui.spacing.s, borderRadius: ui.borderRadiusSm },
  waterQuickBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },

  achievementsCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: ui.spacing.l, marginBottom: ui.spacing.l, ...ui.shadowLg },
  achScroll: { flexDirection: 'row', marginTop: ui.spacing.s },
  achBadge: { width: 100, height: 110, backgroundColor: colors.surfaceSecondary, borderRadius: ui.borderRadius, padding: ui.spacing.m, alignItems: 'center', justifyContent: 'center', marginRight: ui.spacing.m, borderWidth: 1, borderColor: colors.border },
  achBadgeUnlocked: { backgroundColor: colors.primary, borderColor: colors.primary },
  achBadgeTitle: { ...typography.caption, fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 8, height: 28 },
  achBadgeStatus: { ...typography.caption, fontSize: 8, color: colors.textPrimary, opacity: 0.6, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: ui.borderRadiusLg, borderTopRightRadius: ui.borderRadiusLg, padding: ui.spacing.l, height: '75%', justifyContent: 'space-between' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.l },
  modalTitle: { ...typography.title, color: colors.primary },
  emptyNotifs: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: ui.spacing.m },
  emptyNotifsText: { ...typography.subhead, color: colors.textSecondary, textAlign: 'center' },
  notifItem: { flexDirection: 'row', paddingVertical: ui.spacing.m, borderBottomWidth: 1, borderBottomColor: colors.border, gap: ui.spacing.m },
  notifDotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
  notifTextCol: { flex: 1 },
  notifItemTitle: { ...typography.headline },
  notifItemBody: { ...typography.subhead, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  notifItemDate: { ...typography.caption, color: colors.primary, marginTop: 6 },
  clearBtn: { backgroundColor: colors.primary, height: ui.buttonHeight, borderRadius: ui.borderRadius, justifyContent: 'center', alignItems: 'center', marginTop: ui.spacing.m },
  clearBtnText: { ...typography.headline, color: '#FFF' },
});
