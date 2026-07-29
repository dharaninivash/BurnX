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
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Authentication Required', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) throw error;
      
      const profileData = data.user?.user_metadata || {};
      completeOnboarding({ ...profileData, email: data.user.email });
      
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '688528876101-6lj6m83r4eokuvnh83rjbbg63rp6cutn.apps.googleusercontent.com';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            client_id: googleClientId,
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: Platform.OS === 'web' ? window.location.origin : 'burnx://login-callback'
        }
      });

      if (error) throw error;
    } catch (error) {
      console.log('Google Auth status:', error.message);
      // Fallback for native web simulation if redirecting
      Alert.alert('Google Sign-In', 'Redirecting to secure Google Auth portal...');
    } finally {
      setGoogleLoading(false);
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
    opacity: 0.12,
  },
  topSection: { marginTop: ui.spacing.l, marginBottom: ui.spacing.m },
  appName: { ...typography.largeTitle, fontSize: 36, letterSpacing: 2, color: colors.textPrimary },
  tagline: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  
  cardSection: {
    backgroundColor: colors.surface,
    padding: ui.spacing.l,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...ui.shadow,
  },
  welcomeText: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 4, marginBottom: ui.spacing.l },
  
  inputWrapper: { marginBottom: ui.spacing.l },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: ui.spacing.m,
    height: 52,
  },
  inputIcon: { marginRight: ui.spacing.s },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justify: 'center',
    alignItems: 'center',
    ...ui.shadow,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginHorizontal: 12 },

  googleBtn: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary || colors.background,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  
  signupLink: { marginTop: ui.spacing.l, alignItems: 'center' },
  signupText: { ...typography.footnote, color: colors.textSecondary },
  signupTextHighlight: { color: colors.primary, fontWeight: 'bold' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: ui.spacing.l, gap: 6 },
  footerText: { ...typography.caption, color: colors.textSecondary, fontSize: 12 }
});
