import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';
import { supabase } from '../../services/supabase';

const { height, width } = Dimensions.get('window');

export default function Login({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
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
      
      const profileData = data.user.user_metadata || {};
      completeOnboarding({ ...profileData, email: data.user.email });
      
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.backgroundAccent} />
          
          <View style={styles.topSection}>
            <Text style={styles.appName}>BURN<Text style={{ color: colors.primary }}>X</Text></Text>
            <Text style={styles.tagline}>The Ultimate Personalized Wellness Platform</Text>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to access your personalized training plan.</Text>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.inputContainer, { marginTop: ui.spacing.m }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
              {!loading && <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>

            {/* Quick Role Portal Selection */}
            <View style={{ marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, textAlign: 'center', marginBottom: 10 }}>QUICK ROLE PORTAL ACCESS</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <TouchableOpacity 
                  style={{ flex: 1, backgroundColor: colors.surfaceSecondary, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}
                  onPress={() => useStore.getState().bypassAuth('client')}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>Client</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ flex: 1, backgroundColor: colors.surfaceSecondary, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}
                  onPress={() => useStore.getState().bypassAuth('trainer')}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>Trainer</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ flex: 1, backgroundColor: colors.surfaceSecondary, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}
                  onPress={() => useStore.getState().bypassAuth('admin')}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
               <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupTextHighlight}>Sign Up</Text></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={16} color={colors.textSecondary} />
            <Text style={styles.footerText}>Secure Cloud Sync Enabled</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: ui.spacing.l, paddingVertical: ui.spacing.m },
  backgroundAccent: {
    position: 'absolute',
    top: -200,
    right: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.primary,
    opacity: 0.05,
  },
  topSection: { marginTop: height * 0.05, alignItems: 'center' },
  appName: { ...typography.largeTitle, letterSpacing: 2 },
  tagline: { ...typography.callout, color: colors.textSecondary, textAlign: 'center', marginTop: ui.spacing.s, paddingHorizontal: ui.spacing.m },
  
  cardSection: { 
    backgroundColor: colors.surface, 
    borderRadius: ui.borderRadiusLg, 
    padding: ui.spacing.l, 
    borderWidth: 1, 
    borderColor: colors.border, 
    ...ui.shadowLg,
    marginBottom: ui.spacing.l,
    marginTop: ui.spacing.xl,
  },
  welcomeText: { ...typography.title, textAlign: 'center', marginBottom: ui.spacing.xs },
  subtitle: { ...typography.subhead, textAlign: 'center', marginBottom: ui.spacing.xl },
  
  inputWrapper: { marginBottom: ui.spacing.xl },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.surfaceSecondary, 
    borderRadius: ui.borderRadiusSm, 
    paddingHorizontal: ui.spacing.m, 
    height: ui.inputHeight,
    borderWidth: 1, 
    borderColor: 'transparent' // could conditionally set border if focused
  },
  inputIcon: { marginRight: ui.spacing.s },
  textInput: { flex: 1, color: colors.textPrimary, fontSize: typography.body.fontSize, height: '100%' },

  primaryBtn: { 
    backgroundColor: colors.primary, 
    height: ui.buttonHeight,
    borderRadius: ui.borderRadius, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    ...ui.shadow,
  },
  primaryBtnText: { ...typography.headline, color: '#FFFFFF' },
  
  signupLink: { marginTop: ui.spacing.l, alignItems: 'center', padding: ui.spacing.s },
  signupText: { ...typography.subhead },
  signupTextHighlight: { color: colors.primary, fontWeight: '600' },
  
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: ui.spacing.m, marginTop: ui.spacing.l },
  footerText: { ...typography.caption, marginLeft: ui.spacing.xs }
});
