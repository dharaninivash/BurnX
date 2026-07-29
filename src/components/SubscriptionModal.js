import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import RazorpayCheckoutModal, { RAZORPAY_ME_LINK } from './RazorpayCheckoutModal';
import { createRazorpayOrder } from '../services/razorpayService';
import { useStore } from '../store/useStore';

export default function SubscriptionModal({ visible, onClose }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);

  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const unlockPremium = useStore((state) => state.unlockPremium);

  const plans = [
    {
      id: 'weekly',
      name: 'Weekly Sprint Pass',
      priceDisplay: '₹299',
      billing: 'billed weekly',
      amountPaise: 29900,
      badge: null,
      features: ['7 Days Full BurnX Coach AI Access', 'Personal Workout Split Generator', 'Basic Hydration & Nutrition Tracker']
    },
    {
      id: 'monthly',
      name: 'Monthly Athletic Pro',
      priceDisplay: '₹799',
      billing: 'billed monthly',
      amountPaise: 79900,
      badge: 'MOST POPULAR',
      features: ['Unlimited AI Fitness & Form Coach', 'Custom Progressive Overload Logger', 'Menstrual & CNS Recovery Engine', 'Priority Meal Macro Scanner']
    },
    {
      id: 'yearly',
      name: 'Yearly VIP Champion',
      priceDisplay: '₹1,999',
      billing: '₹166/mo (save 80%)',
      amountPaise: 199900,
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

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleBox}>
              <Text style={styles.mainTitle}>BurnX Premium</Text>
              <Text style={styles.subTitle}>Select your plan to unlock elite AI coaching & features</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {plans.map((plan) => {
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
            })}
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.payBtn} onPress={handleProceedToPayment}>
              <Text style={styles.payBtnText}>Proceed to Payment ({activePlanObj.priceDisplay})</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkBtn} 
              onPress={() => Linking.openURL(RAZORPAY_ME_LINK)}
            >
              <Text style={styles.linkBtnText}>Or Pay via razorpay.me/@dharaninivash</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Razorpay Modal */}
        <RazorpayCheckoutModal
          visible={checkoutVisible}
          orderId={currentOrderId}
          amount={activePlanObj.amountPaise}
          onClose={() => setCheckoutVisible(false)}
          onSuccess={handlePaymentSuccess}
        />
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

  planCard: { backgroundColor: colors.background, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', position: 'relative' },
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

  featureList: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  featureText: { color: colors.textSecondary, fontSize: 12, marginLeft: 8, flex: 1 },

  bottomBar: { paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  payBtn: { height: 52, borderRadius: 26, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', ...ui.shadow },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  linkBtn: { marginTop: 10, alignItems: 'center' },
  linkBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' }
});
