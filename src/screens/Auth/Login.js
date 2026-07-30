import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Platform, KeyboardAvoidingView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';
import { supabase } from '../../services/supabase';

const { height, width } = Dimensions.get('window');

export default function Login({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  const completeOnboarding = useStore((state) => state.completeOnboarding);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Authentication Required', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (supabase && supabase.auth) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });

        if (error) throw error;
        
        // Query database profiles table to check if onboarding details were completed
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile && profile.dob && profile.gender) {
          // Existing profile with details -> proceed into App
          completeOnboarding(profile);
          return;
        }
      }

      // If profile missing details -> Redirect to Signup Onboarding to collect details!
      navigation.navigate('Signup', { 
        email: email.trim(),
        name: email.split('@')[0] || 'Athlete'
      });
      
    } catch (error) {
      console.warn('Supabase Login fallback:', error.message);
      const userName = email.split('@')[0] || 'Athlete';
      navigation.navigate('Signup', { email: email.trim(), name: userName });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      if (supabase && supabase.auth) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: Platform.OS === 'web' ? window.location.origin : 'burnx://login-callback'
          }
        });

        if (error) throw error;

        if (data?.url) {
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.location.href = data.url;
            return;
          }
        }
      }

      // Treat Google Login for new account as automatic Sign Up (collect onboarding details)
      navigation.navigate('Signup', { 
        email: 'google.athlete@burnx.com', 
        name: 'Google Athlete',
        isGoogle: true 
      });
    } catch (error) {
      console.warn('Google Sign-In notice:', error.message);
      navigation.navigate('Signup', { 
        email: 'google.athlete@burnx.com', 
        name: 'Google Athlete',
        isGoogle: true 
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.backgroundAccent} />
          
          <View style={styles.wrapper}>
            <View style={styles.topSection}>
              <Text style={styles.appName}>BURN<Text style={{ color: colors.primary }}>X</Text></Text>
              <Text style={styles.tagline}>The Ultimate Personalized Wellness Platform</Text>
            </View>

            <View style={styles.cardSection}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to access your personalized training plan.</Text>

              <View style={styles.inputWrapper}>
                {/* Email Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <View style={[styles.inputContainer, focusedField === 'email' && styles.inputFocused]}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color={focusedField === 'email' ? colors.primary : colors.textSecondary} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View style={[styles.fieldGroup, { marginTop: ui.spacing.m }]}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={[styles.inputContainer, focusedField === 'password' && styles.inputFocused]}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color={focusedField === 'password' ? colors.primary : colors.textSecondary} 
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)} 
                      style={styles.eyeBtn}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                  </View>
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

              {/* Google OAuth Button */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.googleBtn} 
                onPress={handleGoogleLogin}
                disabled={googleLoading}
                activeOpacity={0.8}
              >
                {googleLoading ? (
                  <ActivityIndicator color={colors.textPrimary} size="small" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupTextHighlight}>Sign Up</Text></Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Ionicons name="shield-checkmark" size={16} color={colors.textSecondary} />
              <Text style={styles.footerText}>Protected by Supabase Authentication</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: ui.spacing.l, paddingVertical: ui.spacing.l },
  wrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  backgroundAccent: {
    position: 'absolute',
    top: -200,
    right: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.primary,
    opacity: 0.12,
  },
  topSection: { marginBottom: ui.spacing.l, alignItems: 'center' },
  appName: { ...typography.largeTitle, fontSize: 38, letterSpacing: 3, color: colors.textPrimary, fontWeight: '900' },
  tagline: { ...typography.caption, color: colors.textSecondary, marginTop: 4, letterSpacing: 0.5, textAlign: 'center' },
  
  cardSection: {
    backgroundColor: colors.surface,
    padding: ui.spacing.l,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...ui.shadowLg,
  },
  welcomeText: { ...typography.title, color: colors.textPrimary, fontSize: 24, fontWeight: '700' },
  subtitle: { ...typography.callout, color: colors.textSecondary, marginTop: 4, marginBottom: ui.spacing.l, fontSize: 14 },
  
  inputWrapper: { marginBottom: ui.spacing.l },
  fieldGroup: { width: '100%' },
  fieldLabel: { ...typography.subhead, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, fontSize: 14 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary || colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: ui.inputHeight || 56,
    width: '100%',
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputIcon: { marginRight: 12 },
  textInput: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: Platform.OS === 'web' ? 12 : 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: ui.buttonHeight || 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...ui.shadow,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginHorizontal: 16 },

  googleBtn: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary || colors.background,
    height: ui.buttonHeight || 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    width: '100%',
  },
  googleBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  
  signupLink: { marginTop: ui.spacing.l, alignItems: 'center' },
  signupText: { ...typography.footnote, color: colors.textSecondary, fontSize: 14 },
  signupTextHighlight: { color: colors.primary, fontWeight: 'bold' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: ui.spacing.xl, gap: 6 },
  footerText: { ...typography.caption, color: colors.textSecondary, fontSize: 12 }
});
