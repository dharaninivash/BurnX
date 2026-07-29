import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, CERTIFIED_TRAINERS } from '../../store/useStore';
import { useTheme } from '../../theme/theme';

export default function TrainerDirectory({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const bookedAppointments = useStore((state) => state.bookedAppointments) || [];
  const consultationNotes = useStore((state) => state.consultationNotes) || [];
  
  const bookTrainerAppointment = useStore((state) => state.bookTrainerAppointment);
  const cancelTrainerAppointment = useStore((state) => state.cancelTrainerAppointment);

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Booking form states
  const [selectedDay, setSelectedDay] = useState('Tomorrow');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [bookingReason, setBookingReason] = useState('');

  const nextDays = ['Tomorrow', 'In 2 Days', 'In 3 Days', 'In 4 Days'];

  const [comingSoonModalVisible, setComingSoonModalVisible] = useState(false);

  const openTrainerDetail = (trainer) => {
    setComingSoonModalVisible(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedTrainer) return;
    
    // Call Zustand action
    bookTrainerAppointment(
      selectedTrainer.id,
      selectedTrainer.name,
      selectedDay,
      selectedTimeSlot,
      bookingReason || 'Standard form evaluation and macro tuning.'
    );

    setDetailModalVisible(false);
    setBookingReason('');
    
    Alert.alert(
      'Session Booked!',
      `Successfully scheduled a consultation with ${selectedTrainer.name} for ${selectedDay} at ${selectedTimeSlot}!`,
      [
        { text: 'OK' },
        { text: 'Join Call', onPress: () => navigation.navigate('VideoCall', { roomName: `room_${Math.floor(Math.random()*1000)}` }) }
      ]
    );
  };

  const handleCancelBooking = (id) => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel this trainer consultation?',
      [
        { text: 'Keep Session', style: 'cancel' },
        { 
          text: 'Cancel', 
          onPress: () => {
            cancelTrainerAppointment(id);
            Alert.alert('Cancelled', 'Appointment cancelled successfully.');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.header}>TRAINERS DIRECTORY</Text>
        <Text style={styles.headerSub}>Certified Fitness & Nutrition Specialists</Text>

        {/* 1. SCHEDULED SESSIONS */}
        {bookedAppointments.length > 0 && (
          <View style={styles.appointmentsSection}>
            <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
            {bookedAppointments.map((appt) => (
              <View key={appt.id} style={styles.apptCard}>
                <View style={styles.apptHeader}>
                  <View style={styles.apptHeaderLeft}>
                    <Ionicons name="videocam" size={18} color={colors.primary} />
                    <Text style={styles.apptTrainerName}>{appt.trainerName}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleCancelBooking(appt.id)}>
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.apptTimeText}>
                  📅 {appt.date} • 🕒 {appt.time}
                </Text>
                
                {appt.notes ? (
                  <Text style={styles.apptNotesText}>Goal: "{appt.notes}"</Text>
                ) : null}

                <TouchableOpacity 
                  style={styles.joinCallBtn}
                  onPress={() => navigation.navigate('VideoCall', { roomName: `room_${appt.id}` })}
                >
                  <Ionicons name="videocam-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.joinCallText}>Join Active Call Channel</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 2. TRAINER ROSTER */}
        <Text style={styles.sectionTitle}>Select Your Coach</Text>
        <View style={styles.trainerRosterList}>
          {CERTIFIED_TRAINERS.map((trainer) => (
            <TouchableOpacity 
              key={trainer.id} 
              style={styles.trainerCard}
              onPress={() => openTrainerDetail(trainer)}
            >
              <Image source={{ uri: trainer.imageUrl }} style={styles.trainerImage} />
              
              <View style={styles.trainerInfoCol}>
                <Text style={styles.trainerName}>{trainer.name}</Text>
                <Text style={styles.trainerSpecialty}>{trainer.specialty}</Text>
                
                <View style={styles.trainerStatsRow}>
                  <View style={styles.statLine}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <Text style={styles.statText}>{trainer.rating} rating</Text>
                  </View>
                  <View style={[styles.statLine, { marginLeft: 15 }]}>
                    <Ionicons name="ribbon-outline" size={14} color={colors.primary} />
                    <Text style={styles.statText}>{trainer.experience} exp</Text>
                  </View>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. HISTORICAL CONSULTATION NOTES */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Trainer Feedback Summaries</Text>
          <Text style={styles.notesDesc}>Official medical and training recommendations logged by your assigned coaches.</Text>
          
          {consultationNotes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteTrainerName}>{note.trainerName}</Text>
                <Text style={styles.noteDate}>{note.date}</Text>
              </View>
              <Text style={styles.noteText}>"{note.notes}"</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* TRAINER APPOINTMENT DETAIL & SCHEDULING MODAL */}
      <Modal visible={detailModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTrainer && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Book Consultation</Text>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                    <Ionicons name="close" size={28} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1, marginBottom: 20 }} showsVerticalScrollIndicator={false}>
                  {/* Brief bio card */}
                  <View style={styles.bioCard}>
                    <Image source={{ uri: selectedTrainer.imageUrl }} style={styles.bioImage} />
                    <View style={styles.bioTextCol}>
                      <Text style={styles.bioName}>{selectedTrainer.name}</Text>
                      <Text style={styles.bioSpecialty}>{selectedTrainer.specialty}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.bioPara}>{selectedTrainer.bio}</Text>

                  {/* Date Selector */}
                  <Text style={styles.formLabel}>Select Consultation Date</Text>
                  <View style={styles.daysScrollContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {nextDays.map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[styles.dayChip, selectedDay === day && styles.activeDayChip]}
                          onPress={() => setSelectedDay(day)}
                        >
                          <Text style={[styles.dayChipText, selectedDay === day && { color: colors.background }]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Time Selector */}
                  <Text style={[styles.formLabel, { marginTop: 15 }]}>Available Slots</Text>
                  <View style={styles.slotsGrid}>
                    {selectedTrainer.slots.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.slotChip, selectedTimeSlot === slot && styles.activeSlotChip]}
                        onPress={() => setSelectedTimeSlot(slot)}
                      >
                        <Text style={[styles.slotChipText, selectedTimeSlot === slot && { color: '#FFF' }]}>
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Reason Textbox */}
                  <Text style={[styles.formLabel, { marginTop: 15 }]}>Consultation Goals</Text>
                  <TextInput
                    style={styles.reasonInput}
                    placeholder="E.g. Squat biomechanics evaluation, PCOS nutrition pacing..."
                    placeholderTextColor={colors.textSecondary}
                    value={bookingReason}
                    onChangeText={setBookingReason}
                    multiline
                  />
                </ScrollView>

                <TouchableOpacity style={styles.confirmBookingBtn} onPress={handleConfirmBooking}>
                  <Ionicons name="calendar-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.confirmBookingText}>Confirm Reservation</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* TRAINER CONSULTATION COMING SOON MODAL */}
      <Modal visible={comingSoonModalVisible} transparent animationType="fade" onRequestClose={() => setComingSoonModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 340, backgroundColor: colors.surface, borderRadius: 20, padding: 24, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: colors.primary, elevation: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>Trainer Consultation</Text>
            
            <View style={{ backgroundColor: 'rgba(233, 30, 99, 0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.primary }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: 'bold' }}>🚀 Coming Soon</Text>
            </View>

            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 20 }}>
              Live video consultation with certified trainers is currently under development.{"\n\n"}
              This feature will be available in a future update.{"\n\n"}
              Thank you for your patience.
            </Text>

            <TouchableOpacity 
              style={{ backgroundColor: colors.primary, width: '100%', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }} 
              onPress={() => setComingSoonModalVisible(false)}
            >
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 15, paddingBottom: 40 },
  
  header: { ...typography.header, color: colors.primary, fontSize: 22, fontWeight: '900', paddingTop: 10 },
  headerSub: { ...typography.caption, color: colors.textSecondary, marginTop: -2, marginBottom: 20 },

  appointmentsSection: { marginBottom: 25 },
  sectionTitle: { ...typography.title, fontSize: 16, marginBottom: 12 },
  
  apptCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadius, padding: 15, borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: 12, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  apptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  apptHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apptTrainerName: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },
  apptTimeText: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  apptNotesText: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic', marginBottom: 12 },
  joinCallBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  joinCallText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  trainerRosterList: { gap: 12, marginBottom: 25 },
  trainerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 15, borderRadius: ui.borderRadius, borderWidth: 1, borderColor: colors.border, ...ui.shadow },
  trainerImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: colors.background },
  trainerInfoCol: { flex: 1 },
  trainerName: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
  trainerSpecialty: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  trainerStatsRow: { flexDirection: 'row', marginTop: 8 },
  statLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },

  notesSection: { marginBottom: 20 },
  notesDesc: { fontSize: 11, color: colors.textSecondary, marginBottom: 15, lineHeight: 16 },
  noteCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadius, padding: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 10, ...ui.shadow },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  noteTrainerName: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
  noteDate: { fontSize: 10, color: colors.textSecondary },
  noteText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { ...typography.header, fontSize: 18, color: colors.primary },
  
  bioCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: 15, borderRadius: 12, borderHeight: 1, borderColor: colors.border, borderWidth: 1, marginBottom: 15 },
  bioImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  bioName: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
  bioSpecialty: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  bioPara: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 20 },

  formLabel: { fontSize: 12, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  daysScrollContainer: { flexDirection: 'row', marginBottom: 10 },
  dayChip: { backgroundColor: colors.background, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  activeDayChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: 'bold' },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  slotChip: { backgroundColor: colors.background, width: '48%', paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  activeSlotChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: 'bold' },

  reasonInput: { backgroundColor: colors.background, color: colors.textPrimary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 15, fontSize: 14, height: 80, textAlignVertical: 'top', marginBottom: 20 },
  confirmBookingBtn: { flexDirection: 'row', backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', ...ui.shadow },
  confirmBookingText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
