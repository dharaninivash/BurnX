import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, calculateAgeFromDOB } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function EditProfile({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const user = useStore((state) => state.user) || {};
  const updateProfile = useStore((state) => state.updateProfile);

  // Immutable values (Read-Only)
  const name = user.name || 'Athlete';
  const gender = user.gender || 'Male';
  const dob = user.dob || '2000-01-15';
  const age = calculateAgeFromDOB(dob);

  // Mutable values (Editable anytime)
  const [email, setEmail] = useState(user.email || '');
  const [weight, setWeight] = useState(user.weight ? String(user.weight) : '70');
  const [height, setHeight] = useState(user.height ? String(user.height) : '170');
  const [goal, setGoal] = useState(user.goal || 'Muscle Gain');
  const [activity, setActivity] = useState(user.activityLevel || 'Moderately Active');
  const [experience, setExperience] = useState(user.experience || 'Intermediate');
  const [equipment, setEquipment] = useState(user.equipment || 'Full Gym');
  const [dietaryPreference, setDietaryPreference] = useState(user.dietaryPreference || 'None');
  const [injuries, setInjuries] = useState(user.injuries || '');

  const goals = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Athletic Performance'];
  const activities = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];
  const experiences = ['Beginner', 'Intermediate', 'Advanced'];
  const equipments = ['Full Gym', 'Dumbbell Only', 'Bodyweight Only'];
  const dietPrefs = ['None', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'];

  const handleSave = () => {
    const updates = {
      email: email.trim(),
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 170,
      goal,
      activityLevel: activity,
      experience,
      equipment,
      dietaryPreference,
      injuries: injuries.trim()
    };

    updateProfile(updates);

    Alert.alert('Profile Saved', 'Your physical metrics (Height/Weight/Goals) have been updated and metabolic calorie targets recalculated!');
    navigation.goBack();
  };

  const renderChips = (options, selected, onSelect) => (
    <View style={styles.chipContainer}>
      {options.map((opt) => (
        <TouchableOpacity 
          key={opt} 
          style={[styles.chip, selected === opt && styles.chipActive]} 
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.chipText, selected === opt && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Fitness Baseline</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          
          {/* Permanent Notice */}
          <View style={styles.lockNoticeCard}>
            <Ionicons name="lock-closed" size={20} color="#FF9800" style={{ marginRight: 8 }} />
            <Text style={styles.lockNoticeText}>
              Name, Gender, and DOB were locked during registration and cannot be modified. Height and Weight can be updated anytime!
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Permanent Identity (Locked 🔒)</Text>

          <Text style={styles.label}>Full Name</Text>
          <View style={styles.lockedInputBox}>
            <Text style={styles.lockedInputText}>{name}</Text>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Biological Gender</Text>
              <View style={styles.lockedInputBox}>
                <Text style={styles.lockedInputText}>{gender}</Text>
                <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DOB (Age: {age})</Text>
              <View style={styles.lockedInputBox}>
                <Text style={styles.lockedInputText}>{dob}</Text>
                <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
              </View>
            </View>
          </View>

          <View style={styles.divider} />
          
          <Text style={styles.sectionLabel}>Physical Parameters (Editable ✏️)</Text>
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <View style={styles.divider} />
          
          <Text style={styles.sectionLabel}>Fitness Baseline & Goals</Text>
          <Text style={styles.label}>Primary Fitness Goal</Text>
          {renderChips(goals, goal, setGoal)}

          <Text style={styles.label}>Daily Activity Factor</Text>
          {renderChips(activities, activity, setActivity)}

          <Text style={styles.label}>Lifting Experience</Text>
          {renderChips(experiences, experience, setExperience)}

          <Text style={styles.label}>Equipment Setup</Text>
          {renderChips(equipments, equipment, setEquipment)}

          <Text style={styles.label}>Diet Preference</Text>
          {renderChips(dietPrefs, dietaryPreference, setDietaryPreference)}

          <Text style={styles.label}>Injuries & Joint Limitations</Text>
          <TextInput 
            style={[styles.input, { marginBottom: 30 }]} 
            placeholder="E.g. Mild patella tendinitis, bad back" 
            placeholderTextColor={colors.textSecondary}
            value={injuries} 
            onChangeText={setInjuries} 
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, paddingTop: Platform.OS === 'ios' ? 45 : 15 },
  headerTitle: { ...typography.title, color: colors.primary, fontSize: 18, fontWeight: '900' },
  backBtn: { padding: 5 },
  saveBtn: { padding: 5 },
  content: { padding: 15, paddingBottom: 50, maxWidth: 520, width: '100%', alignSelf: 'center' },
  
  formCard: { backgroundColor: colors.surface, padding: 20, borderRadius: ui.borderRadiusLg, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  
  lockNoticeCard: { flexDirection: 'row', backgroundColor: 'rgba(255, 152, 0, 0.1)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FF9800', marginBottom: 15, alignItems: 'center' },
  lockNoticeText: { flex: 1, fontSize: 11, color: colors.textPrimary, lineHeight: 16 },

  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 15, marginTop: 10 },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 6, color: colors.primary, letterSpacing: 0.5 },
  
  lockedInputBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 15 },
  lockedInputText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 14 },

  input: { backgroundColor: colors.surfaceSecondary, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 15, color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' },
  row: { flexDirection: 'row' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  chip: { backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },
});
