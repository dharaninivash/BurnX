import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, calculateAgeFromDOB } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function EditProfile({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
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

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [confirmInputText, setConfirmInputText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const goals = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Athletic Performance'];
  const activities = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];
  const experiences = ['Beginner', 'Intermediate', 'Advanced'];
  const equipments = ['Full Gym', 'Dumbbell Only', 'Bodyweight Only'];
  const dietPrefs = ['None', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'];

  const deleteAccount = useStore((state) => state.deleteAccount);

  const handleOpenDeleteModal = () => {
    setConfirmInputText('');
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmInputText.trim() !== 'CONFIRM') {
      Alert.alert('Confirmation Mismatch', 'Please type CONFIRM exactly in capital letters to delete your account.');
      return;
    }
    setIsDeleting(true);
    try {
      setDeleteModalVisible(false);
      await deleteAccount();
    } catch (e) {
      console.log('Error during account deletion:', e);
    } finally {
      setIsDeleting(false);
    }
  };

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
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile & Metrics</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          
          {/* IMMUTABLE PROFILE DETAILS NOTICE */}
          <View style={styles.lockNoticeCard}>
            <Ionicons name="lock-closed-outline" size={20} color="#FF9800" style={{ marginRight: 8 }} />
            <Text style={styles.lockNoticeText}>
              Identity locked post-onboarding. Name, Biological Gender, and DOB cannot be modified.
            </Text>
          </View>

          {/* Locked Name */}
          <Text style={styles.label}>FULL NAME (PERMANENT)</Text>
          <View style={styles.lockedInputBox}>
            <Text style={styles.lockedInputText}>{name}</Text>
            <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
          </View>

          {/* Locked Gender & Age */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>GENDER (PERMANENT)</Text>
              <View style={styles.lockedInputBox}>
                <Text style={styles.lockedInputText}>{gender}</Text>
                <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>AGE / DOB (AUTOMATIC)</Text>
              <View style={styles.lockedInputBox}>
                <Text style={styles.lockedInputText}>{age} Yrs ({dob})</Text>
                <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* DYNAMIC EDITABLE METRICS */}
          <Text style={styles.sectionLabel}>Editable Physical Baseline & Goals</Text>

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>WEIGHT (KG)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>HEIGHT (CM)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>PRIMARY FITNESS GOAL</Text>
          {renderChips(goals, goal, setGoal)}

          <Text style={styles.label}>WEEKLY ACTIVITY LEVEL</Text>
          {renderChips(activities, activity, setActivity)}

          <Text style={styles.label}>TRAINING EXPERIENCE</Text>
          {renderChips(experiences, experience, setExperience)}

          <Text style={styles.label}>AVAILABLE EQUIPMENT</Text>
          {renderChips(equipments, equipment, setEquipment)}

          <Text style={styles.label}>DIETARY PREFERENCE</Text>
          {renderChips(dietPrefs, dietaryPreference, setDietaryPreference)}

          <Text style={styles.label}>KNOWN INJURIES / MEDICAL LIMITATIONS</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            value={injuries}
            onChangeText={setInjuries}
            placeholder="e.g. Lower back pain, shoulder impingement..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleOpenDeleteModal}>
            <Ionicons name="trash-outline" size={18} color="#FF4D4D" style={{ marginRight: 6 }} />
            <Text style={styles.deleteAccountText}>Delete My Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.warningIconCircle}>
              <Ionicons name="alert-circle-outline" size={42} color="#FF4D4D" />
            </View>
            <Text style={styles.modalTitle}>PERMANENTLY DELETE ACCOUNT?</Text>
            <Text style={styles.modalSub}>
              This action is <Text style={{ fontWeight: 'bold', color: '#FF4D4D' }}>IRREVERSIBLE</Text>. All your profile details, metabolic targets, calorie logs, and database records will be erased forever.
            </Text>
            <Text style={styles.modalPrompt}>
              To confirm, type <Text style={styles.capitalTag}>CONFIRM</Text> in capital letters below:
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="CONFIRM"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={confirmInputText}
              onChangeText={setConfirmInputText}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalDeleteBtn,
                  confirmInputText.trim() !== 'CONFIRM' && styles.modalDeleteBtnDisabled
                ]}
                disabled={confirmInputText.trim() !== 'CONFIRM' || isDeleting}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalDeleteText}>
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  chip: { backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },

  deleteAccountBtn: { flexDirection: 'row', height: 48, backgroundColor: 'rgba(255, 77, 77, 0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FF4D4D', marginTop: 15, marginBottom: 20 },
  deleteAccountText: { color: '#FF4D4D', fontWeight: 'bold', fontSize: 14 },

  // MODAL STYLES FOR DELETE ACCOUNT
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 440, backgroundColor: '#181820', borderRadius: 24, padding: 24, borderWidth: 1.5, borderColor: '#FF4D4D', alignItems: 'center' },
  warningIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,77,77,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  modalSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  modalPrompt: { color: '#FFF', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  capitalTag: { color: '#FF4D4D', fontWeight: '900', letterSpacing: 1 },
  modalInput: { width: '100%', height: 48, backgroundColor: '#22222E', borderRadius: 12, borderWidth: 1.5, borderColor: '#FF4D4D', color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: 'bold', letterSpacing: 2, marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, height: 46, borderRadius: 23, backgroundColor: '#2B2B36', justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  modalDeleteBtn: { flex: 1, height: 46, borderRadius: 23, backgroundColor: '#FF4D4D', justifyContent: 'center', alignItems: 'center' },
  modalDeleteBtnDisabled: { opacity: 0.35, backgroundColor: '#552222' },
  modalDeleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
