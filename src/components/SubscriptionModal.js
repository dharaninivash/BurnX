import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import RazorpayCheckoutModal from './RazorpayCheckoutModal';
import { createRazorpayOrder } from '../services/razorpayService';
import { useStore } from '../store/useStore';

export default function SubscriptionModal({ visible, onClose }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);

  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [confirmRefundModal, setConfirmRefundModal] = useState(false);

  const isPremium = useStore((state) => state.isPremium);
  const subscriptionPlan = useStore((state) => state.subscriptionPlan);
  const subscriptionExpiryDate = useStore((state) => state.subscriptionExpiryDate);
  const aiPromptsUsed = useStore((state) => state.aiPromptsUsed) || 0;
  
  const unlockPremium = useStore((state) => state.unlockPremium);
  const requestSubscriptionRefund = useStore((state) => state.requestSubscriptionRefund);

  const plans = [
    {
      id: 'weekly',
      name: 'Weekly Sprint Pass',
      priceDisplay: '₹10',
      billing: 'billed weekly',
      amountPaise: 1000,
      badge: null,
      features: ['7 Days Full BurnX Coach AI Access', 'Personal Workout Split Generator', 'Basic Hydration & Nutrition Tracker']
    },
    {
      id: 'monthly',
      name: 'Monthly Athletic Pro',
      priceDisplay: '₹100',
      billing: 'billed monthly',
      amountPaise: 10000,
      badge: 'MOST POPULAR',
      features: ['Unlimited AI Fitness & Form Coach', 'Custom Progressive Overload Logger', 'Menstrual & CNS Recovery Engine', 'Priority Meal Macro Scanner']
    },
    {
      id: 'yearly',
      name: 'Yearly VIP Champion',
      priceDisplay: '₹1,000',
      billing: 'billed annually',
      amountPaise: 100000,
      badge: 'BEST VALUE',
      features: ['All Monthly Pro Features Included', 'Lifetime VIP Achievement Badges', 'Trainer Consultation Priority Pass', '24/7 Unlimited AI Coaching Access']
    }
  ];

  const activePlanObj = plans.find(p => p.id === selectedPlan) || plans[2];

  const handleProceedToPayment = async () => {
    const orderId = await createRazorpayOrder(activePlanObj.amountPaise);
    setCurrentOrderId(orderId);
    setCheckoutVisible(true);
  };

  const handlePaymentSuccess = () => {
    setCheckoutVisible(false);
    unlockPremium(selectedPlan);
    onClose();
  };

  const handleApplyRefund = () => {
    setConfirmRefundModal(true);
  };

  const executeRefund = () => {
    setConfirmRefundModal(false);
    const result = requestSubscriptionRefund();
    if (result.success) {
      Alert.alert('💰 Refund Approved', result.message);
    } else {
      Alert.alert('⚠️ Refund Denied', result.message);
    }
  };

  if (!visible) return null;

  const isEligibleForRefund = aiPromptsUsed < 5;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleBox}>
              <Text style={styles.mainTitle}>BurnX Premium</Text>
              <Text style={styles.subTitle}>
                {isPremium ? 'Manage your active subscription & refund policy' : 'Select your plan to unlock elite AI coaching & features'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* IF USER ALREADY HAS AN ACTIVE PREMIUM SUBSCRIPTION */}
            {isPremium ? (
              <View style={styles.activeSubCard}>
                <View style={styles.activeHeader}>
                  <Ionicons name="checkmark-circle" size={26} color="#4CAF50" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.activeTitle}>Active Premium Subscription</Text>
                    <Text style={styles.activeSubPlan}>
                      Plan: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{subscriptionPlan ? subscriptionPlan.toUpperCase() : 'VIP'}</Text>
                    </Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* REFUND ELIGIBILITY POLICY CARD */}
                <View style={styles.refundPolicyBox}>
                  <Text style={styles.refundPolicyTitle}>BurnX Subscription Refund Guarantee Policy</Text>
                  <Text style={styles.refundPolicyText}>
                    Users can apply for a 100% full subscription refund <Text style={{ fontWeight: 'bold', color: colors.primary }}>ONLY IF</Text> they have used the BurnX AI Coach for <Text style={{ fontWeight: 'bold', color: '#4CAF50' }}>fewer than 5 chats/prompts (&lt; 5)</Text>. Once 5 or more prompts are sent, the refund window closes. Upon refund, BurnX Coach AI access will lock immediately.
                  </Text>

                  <View style={styles.promptsCounterCard}>
                    <View style={styles.promptsRow}>
                      <Text style={styles.promptsLabel}>AI Prompts Used:</Text>
                      <Text style={[styles.promptsValue, isEligibleForRefund ? { color: '#4CAF50' } : { color: '#FF4D4D' }]}>
                        {aiPromptsUsed} / 4 Max
                      </Text>
                    </View>

                    <View style={styles.statusBadgeRow}>
                      {isEligibleForRefund ? (
                        <View style={styles.eligibleBadge}>
                          <Ionicons name="checkmark-circle-outline" size={14} color="#4CAF50" />
                          <Text style={styles.eligibleText}>ELIGIBLE FOR INSTANT REFUND</Text>
                        </View>
                      ) : (
                        <View style={styles.ineligibleBadge}>
                          <Ionicons name="close-circle-outline" size={14} color="#FF4D4D" />
                          <Text style={styles.ineligibleText}>REFUND WINDOW CLOSED (&ge; 5 Prompts Used)</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.refundBtn, !isEligibleForRefund && styles.refundBtnDisabled]}
                    onPress={handleApplyRefund}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh-circle-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.refundBtnText}>Apply for Full Refund</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* SUBSCRIPTION PLANS SELECTION FOR NON-PREMIUM USERS */
              plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.planCard, isSelected && styles.planCardActive]}
                    onPress={() => setSelectedPlan(plan.id)}
                    activeOpacity={0.8}
                  >
                    {plan.badge && (
                      <View style={[styles.badge, plan.id === 'yearly' ? styles.badgeYearly : styles.badgeMonthly]}>
                        <Text style={styles.badgeText}>{plan.badge}</Text>
                      </View>
                    )}

                    <View style={styles.planHeader}>
                      <View style={styles.radioBox}>
                        <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <View>
                          <Text style={styles.planName}>{plan.name}</Text>
                          <Text style={styles.planBilling}>{plan.billing}</Text>
                        </View>
                      </View>

                      <Text style={styles.planPrice}>{plan.priceDisplay}</Text>
                    </View>

                    <View style={styles.featureList}>
                      {plan.features.map((feat, idx) => (
                        <View key={idx} style={styles.featureItem}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                          <Text style={styles.featureText}>{feat}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Bottom Actions */}
          {!isPremium && (
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.payBtn} onPress={handleProceedToPayment}>
                <Text style={styles.payBtnText}>Proceed to Payment ({activePlanObj.priceDisplay})</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Razorpay Modal */}
        <RazorpayCheckoutModal
          visible={checkoutVisible}
          orderId={currentOrderId}
          amount={activePlanObj.amountPaise}
          onClose={() => setCheckoutVisible(false)}
          onSuccess={handlePaymentSuccess}
        />

        {/* CONFIRM REFUND MODAL */}
        <Modal visible={confirmRefundModal} transparent animationType="fade" onRequestClose={() => setConfirmRefundModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.warningIconCircle}>
                <Ionicons name="cash-outline" size={38} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>APPLY FOR SUBSCRIPTION REFUND?</Text>
              <Text style={styles.modalSub}>
                You have used <Text style={{ fontWeight: 'bold', color: '#4CAF50' }}>{aiPromptsUsed} / 4 prompts</Text>. Your refund is eligible and will be processed immediately.
              </Text>
              <Text style={styles.modalNotice}>
                ⚠️ Note: Once refunded, your BurnX Coach AI and Premium features will lock immediately.
              </Text>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setConfirmRefundModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalConfirmBtn} onPress={executeRefund}>
                  <Text style={styles.modalConfirmText}>Confirm Refund</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </Modal>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  card: { height: '90%', backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleBox: { flex: 1 },
  mainTitle: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  subTitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  closeBtn: { padding: 6, backgroundColor: colors.background, borderRadius: 20 },

  activeSubCard: { backgroundColor: colors.background, borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#4CAF50' },
  activeHeader: { flexDirection: 'row', alignItems: 'center' },
  activeTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  activeSubPlan: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  activeBadge: { backgroundColor: 'rgba(76, 175, 80, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#4CAF50' },
  activeBadgeText: { color: '#4CAF50', fontSize: 11, fontWeight: '900' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },

  refundPolicyBox: { backgroundColor: colors.surfaceSecondary, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  refundPolicyTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  refundPolicyText: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 14 },
  
  promptsCounterCard: { backgroundColor: colors.surface, padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  promptsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  promptsLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  promptsValue: { fontSize: 15, fontWeight: '900' },
  
  statusBadgeRow: { marginTop: 4 },
  eligibleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  eligibleText: { color: '#4CAF50', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  ineligibleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 77, 77, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ineligibleText: { color: '#FF4D4D', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },

  refundBtn: { height: 48, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  refundBtnDisabled: { opacity: 0.4, backgroundColor: colors.surfaceSecondary },
  refundBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

  planCard: { backgroundColor: colors.background, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1.5, borderColor: colors.border, position: 'relative' },
  planCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(233,30,99,0.06)' },

  badge: { position: 'absolute', top: -10, right: 16, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeMonthly: { backgroundColor: '#FF9800' },
  badgeYearly: { backgroundColor: colors.primary },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  radioBox: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.textSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  radioOuterActive: { borderColor: colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  planName: { color: colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  planBilling: { color: colors.textSecondary, fontSize: 12 },
  planPrice: { color: colors.textPrimary, fontSize: 22, fontWeight: '900' },

  featureList: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  featureText: { color: colors.textSecondary, fontSize: 12, marginLeft: 8, flex: 1 },

  bottomBar: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  payBtn: { height: 52, borderRadius: 26, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', ...ui.shadow },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: 24, padding: 24, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center' },
  warningIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(233,30,99,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  modalSub: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 12, lineHeight: 18 },
  modalNotice: { color: '#FF9800', fontSize: 12, textAlign: 'center', marginBottom: 20, lineHeight: 16, fontStyle: 'italic' },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, height: 46, borderRadius: 23, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  modalCancelText: { color: colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
  modalConfirmBtn: { flex: 1, height: 46, borderRadius: 23, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  modalConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
