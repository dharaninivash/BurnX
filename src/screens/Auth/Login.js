import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';
import { supabase } from '../../services/supabase';

const { height } = Dimensions.get('window');

export default function Login({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const bypassAuth = useStore((state) => state.bypassAuth);
  const completeOnboarding = useStore((state) => state.completeOnboarding);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) throw error;
      
      // Load user profile from Supabase metadata
      const profileData = data.user.user_metadata || {};
      completeOnboarding({ ...profileData, email: data.user.email });
      
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }} showsVerticalScrollIndicator={false}>
        {/* Decorative gradient / layout background */}
        <View style={styles.backgroundAccent} />
        
        <View style={styles.topSection}>
          <Text style={styles.appName}>FIT<Text style={{ color: colors.primary }}>AXIS</Text></Text>
          <Text style={styles.tagline}>The Ultimate Personalized Fitness & Wellness Axis</Text>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your personalized axis.</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { marginTop: 15, marginBottom: 25 }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            {!loading && <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 10 }} />}
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => navigation.navigate('Signup')}>
             <Text style={{ color: colors.textSecondary, ...typography.body }}>Don't have an account? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sign Up</Text></Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR EXPLORE DEMO</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoButtonsRow}>
            <TouchableOpacity 
              style={styles.demoBtn} 
              onPress={() => bypassAuth('member')}
            >
              <Ionicons name="person" size={20} color={colors.primary} />
              <Text style={styles.demoBtnText}>Member Guest</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.demoBtn, { borderColor: '#E91E63' }]} 
              onPress={() => bypassAuth('trainer')}
            >
              <Ionicons name="ribbon" size={20} color="#E91E63" />
              <Text style={[styles.demoBtnText, { color: '#E91E63' }]}>Trainer Guest</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color={colors.textSecondary} />
          <Text style={styles.footerText}>Secure Cloud Sync Enabled</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 25 },
  backgroundAccent: {
    position: 'absolute',
    top: -200,
    right: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 122, 0, 0.08)',
    // filter: 'blur(80px)', // filter might not work perfectly across all RN, keep simple
  },
  topSection: { marginTop: height * 0.08, alignItems: 'center' },
  appName: { fontSize: 44, fontWeight: '900', color: colors.textPrimary, letterSpacing: 2 },
  tagline: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  
  cardSection: { 
    backgroundColor: colors.surface, 
    borderRadius: 24, 
    padding: 25, 
    borderWidth: 1, 
    borderColor: colors.border, 
    ...ui.shadow,
    marginBottom: 20,
    marginTop: 30,
  },
  welcomeText: { ...typography.header, fontSize: 24, textAlign: 'center', marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 20, marginBottom: 25 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: colors.textPrimary, paddingVertical: 14, fontSize: 16 },

  primaryBtn: { 
    backgroundColor: colors.primary, 
    paddingVertical: 16, 
    borderRadius: 14, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    ...ui.shadow,
  },
  primaryBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textSecondary, marginHorizontal: 15, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  
  demoButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  demoBtn: { 
    flex: 0.48, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: colors.background, 
    borderWidth: 1, 
    borderColor: colors.primary, 
    paddingVertical: 14, 
    borderRadius: 12,
  },
  demoBtnText: { color: colors.primary, fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
  
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Platform.OS === 'ios' ? 20 : 10, marginTop: 20 },
  footerText: { ...typography.caption, marginLeft: 6, fontSize: 12 }
});
