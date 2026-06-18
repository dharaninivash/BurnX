import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function EditProfile({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const user = useStore((state) => state.user) || {};
  const updateProfile = useStore((state) => state.updateProfile);

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [age, setAge] = useState(user.age ? String(user.age) : '25');
  const [weight, setWeight] = useState(user.weight ? String(user.weight) : '70');
  const [height, setHeight] = useState(user.height ? String(user.height) : '170');
  const [gender, setGender] = useState(user.gender || 'Male');
  const [goal, setGoal] = useState(user.goal || 'Muscle Gain');
  const [activity, setActivity] = useState(user.activityLevel || 'Moderately Active');
  
  // Custom properties
  const [experience, setExperience] = useState(user.experience || 'Intermediate');
  const [equipment, setEquipment] = useState(user.equipment || 'Full Gym');
  const [dietaryPreference, setDietaryPreference] = useState(user.dietaryPreference || 'None');
  const [injuries, setInjuries] = useState(user.injuries || '');

  const genders = ['Male', 'Female', 'Other'];
  const goals = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Athletic Performance'];
  const activities = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];
  const experiences = ['Beginner', 'Intermediate', 'Advanced'];
  const equipments = ['Full Gym', 'Dumbbell Only', 'Bodyweight Only'];
  const dietPrefs = ['None', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full Name cannot be empty.');
      return;
    }

    const updates = {
      name: name.trim(),
      email: email.trim(),
      age: parseInt(age) || 25,
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 170,
      gender,
      goal,
      activityLevel: activity,
      experience,
      equipment,
      dietaryPreference,
      injuries: injuries.trim()
    };

    // Update local Zustand store
    updateProfile(updates);

    Alert.alert('Profile Hydrated', 'Your physical metrics have been updated and calories/macronutrients target recalculated successfully!');
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
        <Text style={styles.headerTitle}>Edit Baseline</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Ionicons name="checkmark" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          
          <Text style={styles.sectionLabel}>Core Account Identity</Text>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Email Address (local storage)</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <View style={styles.divider} />
          
          <Text style={styles.sectionLabel}>Physical Attributes</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 15 }}>
              <Text style={styles.label}>Age</Text>
              <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />
            </View>
          </View>
          
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />

          <Text style={styles.label}>Gender</Text>
          {renderChips(genders, gender, setGender)}

          <View style={styles.divider} />
          
          <Text style={styles.sectionLabel}>Fitness Baseline</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, paddingTop: Platform.OS === 'ios' ? 45 : 15 },
  headerTitle: { ...typography.title, color: colors.primary, fontSize: 18, fontWeight: '900' },
  backBtn: { padding: 5 },
  saveBtn: { padding: 5 },
  content: { padding: 15, paddingBottom: 50 },
  
  formCard: { backgroundColor: colors.surface, padding: 20, borderRadius: ui.borderRadius, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  sectionLabel: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 15, marginTop: 10 },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 6, color: colors.primary, letterSpacing: 0.5 },
  input: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10, marginBottom: 20, color: colors.textPrimary, fontSize: 15 },
  row: { flexDirection: 'row' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  chip: { backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: colors.textPrimary, fontWeight: 'bold' },
});
