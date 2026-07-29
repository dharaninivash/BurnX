import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useStore } from '../../store/useStore';
export default function Chatbot() {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { id: 1, sender: 'ai', text: 'Hi Athlete! I am your BurnX Coach. How can I help you today?' },
  ]);
  const aiChatCount = useStore((state) => state.aiChatCount);
  const aiChatMonth = useStore((state) => state.aiChatMonth);
  const isPremium = useStore((state) => state.isPremium);
  const incrementAiChatCount = useStore((state) => state.incrementAiChatCount);

  const isLimitReached = !isPremium && aiChatMonth === new Date().getMonth() && aiChatCount >= 5;

  const handleSend = async (text = message) => {
    if (!text.trim()) return;
    if (isLimitReached) return;

    incrementAiChatCount();

    // Add user message
    const newChat = [...chat, { id: Date.now(), sender: 'user', text }];
    setChat(newChat);
    setMessage('');

    try {
      const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a strict fitness coach for BurnX. You must ONLY answer questions related to gym, workouts, fitness, nutrition, supplements, and health. If the user asks about anything else, politely decline to answer and remind them of your purpose.' },
            { role: 'user', content: text }
          ]
        })
      });

      const data = await response.json();

      if (response.ok && data.choices && data.choices.length > 0) {
        const aiResponse = data.choices[0].message.content;
        setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: aiResponse }]);
      } else if (data.error) {
        console.error('Groq API Error Payload:', data.error);
        setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: `API Error: ${data.error.message}` }]);
      } else {
        console.error('Unexpected API Response:', data);
        setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: "I'm sorry, I couldn't process that response." }]);
      }
    } catch (error) {
      console.error('Groq API Error:', error);
      setChat(prev => [...prev, { id: Date.now(), sender: 'ai', text: "Network error connecting to BurnX Coach." }]);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>BurnX AI Coach</Text>
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 20 }}>
        {chat.map((msg) => (
          <View key={msg.id} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            {msg.sender === 'ai' && <Ionicons name="hardware-chip" size={20} color={colors.primary} style={{ marginRight: 10 }} />}
            <Text style={[styles.messageText, msg.sender === 'user' && styles.userText]}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>



      {isLimitReached ? (
        <View style={styles.limitContainer}>
          <Text style={styles.limitText}>You've reached your monthly free AI Coach limit. Upgrade to BurnX Premium for unlimited coaching.</Text>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(message)}>
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { ...typography.header, textAlign: 'center' },
  chatArea: { flex: 1 },
  messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 15, marginBottom: 15, flexDirection: 'row' },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  aiBubble: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  messageText: { ...typography.body, flexShrink: 1 },
  userText: { color: colors.textPrimary },
  promptsContainer: { paddingHorizontal: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  promptBtn: { backgroundColor: colors.surface, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: colors.primary },
  promptText: { ...typography.caption, color: colors.primary },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: colors.surface, alignItems: 'center' },
  input: { flex: 1, backgroundColor: colors.background, color: colors.textPrimary, padding: 12, borderRadius: 25, paddingHorizontal: 20, fontSize: 16 },
  sendBtn: { backgroundColor: colors.primary, width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  limitContainer: { padding: 20, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  limitText: { color: colors.error, textAlign: 'center', fontSize: 14, fontWeight: 'bold' }
});
