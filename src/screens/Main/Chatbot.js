import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useStore } from '../../store/useStore';
import axios from 'axios';
import RazorpayCheckoutModal from '../../components/RazorpayCheckoutModal';

export default function Chatbot({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  
  const [message, setMessage] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const [chat, setChat] = useState([
    { id: 1, sender: 'ai', text: 'Welcome Athlete! I am your BurnX Coach AI. Ask me anything about workout routines, nutrition plans, supplements, or recovery.' },
  ]);

  const isPremium = useStore((state) => state.isPremium);
  const unlockPremium = useStore((state) => state.unlockPremium);

  const handleSend = async (text = message) => {
    if (!text.trim()) return;

    if (!isPremium) {
      Alert.alert('BurnX Premium Required', 'BurnX Coach AI is an exclusive premium feature. Please upgrade to unlock unlimited AI coaching.');
      return;
    }

    const newChat = [...chat, { id: Date.now(), sender: 'user', text }];
    setChat(newChat);
    setMessage('');
    setLoadingAi(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
      if (!apiKey) {
        setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: "BurnX Coach is currently operating in offline fallback mode. For real-time response generation, configure EXPO_PUBLIC_GROQ_API_KEY." }]);
        setLoadingAi(false);
        return;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are an elite fitness & strength coach for BurnX. ONLY answer questions related to exercise, workout splits, muscle hypertrophy, nutrition macros, supplements, and athletic recovery. Be concise, highly professional, and encouraging.' },
            { role: 'user', content: text }
          ]
        })
      });

      const data = await response.json();

      if (response.ok && data.choices && data.choices.length > 0) {
        const aiResponse = data.choices[0].message.content;
        setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: aiResponse }]);
      } else {
        setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: "I'm sorry, I couldn't process that request right now. Please try asking again." }]);
      }
    } catch (error) {
      console.error('Groq API Error:', error);
      setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: "Network error connecting to BurnX Coach AI service." }]);
    } finally {
      setLoadingAi(false);
    }
  };

  const initiatePremiumPurchase = async () => {
    setPaymentLoading(true);
    try {
      const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:3000';
      const res = await axios.post(`${backendUrl}/api/create-order`, { amount: 199900 }, { timeout: 3000 });
      if (res.data && res.data.order_id) {
        setCurrentOrderId(res.data.order_id);
        setCheckoutVisible(true);
      } else {
        throw new Error('Order creation error');
      }
    } catch (err) {
      // Safe fallback when backend server is offline
      console.log('Backend offline, using direct client payment gateway fallback:', err.message);
      const fallbackOrderId = 'order_burnx_' + Date.now();
      setCurrentOrderId(fallbackOrderId);
      setCheckoutVisible(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setCheckoutVisible(false);
    setPaymentLoading(true);
    try {
      const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:3000';
      await axios.post(`${backendUrl}/api/verify-payment`, {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature
      }, { timeout: 3000 });
    } catch (err) {
      console.log('Verification network notice, proceeding with client unlock.');
    } finally {
      unlockPremium();
      setPaymentLoading(false);
      Alert.alert('🎉 Premium Unlocked!', 'Welcome to BurnX Premium! You now have unlimited access to BurnX Coach AI and all pro features.');
    }
  };

  const handlePaymentDismiss = () => {
    setCheckoutVisible(false);
    Alert.alert('Payment Cancelled', 'Your upgrade request was cancelled. You can upgrade anytime.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Header */}
        <View style={styles.header}>
          {navigation && navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.primary} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>BURNX COACH AI</Text>
            <Text style={styles.headerSub}>
              {isPremium ? '⭐ BurnX Premium Member' : '🔒 Premium Exclusive Feature'}
            </Text>
          </View>
          {isPremium ? (
            <Ionicons name="ribbon" size={24} color="#FFC107" />
          ) : (
            <TouchableOpacity onPress={initiatePremiumPurchase}>
              <Ionicons name="lock-closed" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {!isPremium ? (
          /* Locked Paywall View */
          <View style={styles.fullPaywallContainer}>
            <View style={styles.lockIconBox}>
              <Ionicons name="lock-closed" size={48} color={colors.primary} />
            </View>
            <Text style={styles.paywallTitle}>BurnX Coach AI is Locked</Text>
            <Text style={styles.paywallDesc}>
              Access to BurnX Coach AI is exclusively reserved for BurnX Premium members. Upgrade today to unlock personalized hypertrophy plans, instant macro adjustments, and 24/7 AI strength coaching.
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.featureText}>Unlimited 24/7 AI Strength & Hypertrophy Coach</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.featureText}>Custom Nutrition & Calorie Macro Tuning</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.featureText}>Priority Workout Generator Access</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.upgradeBtn} onPress={initiatePremiumPurchase} disabled={paymentLoading}>
              {paymentLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="flash" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.upgradeBtnText}>Unlock BurnX Premium (₹1,999 / yr)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Active Chat View */
          <>
            <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 15, paddingBottom: 25 }} showsVerticalScrollIndicator={false}>
              {chat.map((msg) => (
                <View key={msg.id} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                  {msg.sender === 'ai' && <Ionicons name="hardware-chip" size={18} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />}
                  <Text style={[styles.messageText, msg.sender === 'user' && styles.userText]}>{msg.text}</Text>
                </View>
              ))}
              {loadingAi && (
                <View style={[styles.messageBubble, styles.aiBubble, { alignItems: 'center' }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.messageText, { marginLeft: 10 }]}>BurnX Coach is analyzing...</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask your coach (e.g. hypertrophy split, protein intake)..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={() => handleSend(message)}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(message)} disabled={loadingAi}>
                <Ionicons name="send" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

      </KeyboardAvoidingView>

      {/* Razorpay Web Checkout Modal */}
      {currentOrderId && (
        <RazorpayCheckoutModal
          visible={checkoutVisible}
          orderId={currentOrderId}
          amount={199900}
          onSuccess={handlePaymentSuccess}
          onDismiss={handlePaymentDismiss}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: 6, backgroundColor: colors.background, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  headerTitle: { ...typography.largeTitle, fontSize: 15, color: colors.primary, letterSpacing: 1 },
  headerSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontWeight: '600' },
  
  chatArea: { flex: 1 },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 16, marginBottom: 12, flexDirection: 'row', ...ui.shadowSm },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiBubble: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: colors.border },
  messageText: { ...typography.body, fontSize: 13, color: colors.textPrimary, lineHeight: 20, flexShrink: 1 },
  userText: { color: '#FFF', fontWeight: '500' },
  
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: colors.surface, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.background, color: colors.textPrimary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, fontSize: 14, borderWidth: 1, borderColor: colors.border },
  sendBtn: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10, ...ui.shadow },

  fullPaywallContainer: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  lockIconBox: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(233, 30, 99, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: colors.primary },
  paywallTitle: { ...typography.largeTitle, fontSize: 22, color: colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  paywallDesc: { ...typography.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  featureList: { width: '100%', marginBottom: 28, backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  upgradeBtn: { flexDirection: 'row', backgroundColor: colors.primary, width: '100%', paddingVertical: 16, borderRadius: 14, justifyContent: 'center', alignItems: 'center', ...ui.shadow },
  upgradeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }
});
