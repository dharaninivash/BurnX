import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useStore } from '../../store/useStore';
import SubscriptionModal from '../../components/SubscriptionModal';
import BurnX3DFitnessWidget from '../../components/3d/BurnX3DFitnessWidget';
import AppleCard from '../../components/ui/AppleCard';

export default function Chatbot({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  
  const [message, setMessage] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Enabled demo/trial mode so AI works immediately

  const [chat, setChat] = useState([
    { id: 1, sender: 'ai', text: 'Welcome Athlete! I am your BurnX Coach AI. Ask me anything about workout routines, nutrition plans, supplements, or athletic recovery.' },
  ]);

  const isPremium = useStore((state) => state.isPremium);
  const unlockPremium = useStore((state) => state.unlockPremium);

  // Smart Offline Fitness Intelligence Generator
  const generateOfflineFitnessResponse = (query) => {
    const q = query.toLowerCase();
    
    if (q.includes('protein') || q.includes('macro') || q.includes('diet') || q.includes('nutrition') || q.includes('eat')) {
      return "For optimal muscle hypertrophy & synthesis, aim for 1.8g - 2.2g of protein per kg of total body weight daily. Space your intake across 4-5 meal windows containing 30-40g of high-leucine protein sources like chicken breast, paneer, eggs, or whey protein isolate.";
    }
    if (q.includes('workout') || q.includes('routine') || q.includes('split') || q.includes('plan') || q.includes('gym')) {
      return "For maximum hypertrophic growth, a 4 to 5-day Push-Pull-Legs (PPL) or Upper-Lower split is gold-standard. Focus on progressive overload, targeting 10-18 total work sets per muscle group weekly in the 6-12 rep range near RPE 8-9.";
    }
    if (q.includes('supplement') || q.includes('creatine') || q.includes('preworkout') || q.includes('whey')) {
      return "Top evidence-based supplement stack:\n1. Creatine Monohydrate (5g/day for ATP cellular energy & muscle volume).\n2. Whey Protein Isolate (post-workout recovery).\n3. L-Citrulline Malate (6-8g 30 mins pre-workout for nitric oxide vasodilation).\n4. Vitamin D3 & Zinc for hormonal baseline.";
    }
    if (q.includes('fat') || q.includes('weight loss') || q.includes('cut') || q.includes('deficit')) {
      return "To achieve steady fat loss while preserving maximum lean tissue, calculate your TDEE and maintain a moderate 300-500 kcal daily deficit. Keep protein high (2.0g/kg), prioritize heavy resistance training, and track 8,000-10,000 daily steps for steady non-exercise activity (NEAT).";
    }
    if (q.includes('recover') || q.includes('sleep') || q.includes('sore') || q.includes('rest')) {
      return "Muscle tissue develops during deep sleep, not during training. Ensure 7.5 to 9 hours of uninterrupted sleep nightly. Manage Central Nervous System (CNS) fatigue by taking a scheduled deload week every 6-8 weeks, reducing volume by 40% while keeping heavy intensity.";
    }
    
    return `BurnX AI Coach Diagnostic for "${query}": To maximize your physiological adaptation, align your resistance training intensity with dynamic macro tracking. Maintain progressive overload on core compound movements (Squat, Bench, Deadlift, Overhead Press) and ensure adequate hydration (3-4L daily).`;
  };

  const handleSend = async (text = message) => {
    if (!text.trim()) return;

    if (!isPremium && !demoMode) {
      Alert.alert('BurnX Premium Required', 'BurnX Coach AI is locked. Upgrade to BurnX Premium to unlock unlimited AI coaching.');
      return;
    }

    useStore.getState().incrementAiChatCount();

    const newChat = [...chat, { id: Date.now(), sender: 'user', text }];
    setChat(newChat);
    setMessage('');
    setLoadingAi(true);

    try {
      const apiKey = (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_GROQ_API_KEY) || '';
      
      if (apiKey) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: 'You are an elite fitness & strength coach for BurnX. Answer questions related to exercise, workout splits, muscle hypertrophy, nutrition macros, supplements, and athletic recovery. Be concise, highly professional, and encouraging.' },
              { role: 'user', content: text }
            ]
          })
        });

        const data = await response.json();
        if (response.ok && data.choices && data.choices.length > 0) {
          const aiResponse = data.choices[0].message.content;
          setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: aiResponse }]);
          return;
        }
      }

      // Offline Smart AI Fallback
      setTimeout(() => {
        const fallbackText = generateOfflineFitnessResponse(text);
        setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: fallbackText }]);
        setLoadingAi(false);
      }, 600);

    } catch (error) {
      const fallbackText = generateOfflineFitnessResponse(text);
      setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: fallbackText }]);
    } finally {
      setLoadingAi(false);
    }
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
              {isPremium ? '⭐ BurnX Premium Member' : '⚡ Trial & Pro Fitness Intelligence'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => unlockPremium()}>
            <Ionicons name={isPremium ? "ribbon" : "sparkles"} size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Active Chat View (Always Active with Fallback Intelligence) */}
        <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 15, paddingBottom: 35 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
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
            placeholder="Ask your coach (e.g. hypertrophy split, protein, supplements)..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => handleSend(message)}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(message)} disabled={loadingAi}>
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      <SubscriptionModal
        visible={subModalVisible}
        onClose={() => setSubModalVisible(false)}
      />
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
  sendBtn: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10, ...ui.shadow }
});
