import { supabase } from './supabase';

export const AppointmentService = {
  async bookAppointment(clientId, trainerId, date, timeSlot, notes) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          client_id: clientId,
          trainer_id: trainerId,
          appointment_date: date,
          time_slot: timeSlot,
          notes: notes,
          status: 'pending'
        }
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(appointmentId, status) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async fetchClientAppointments(clientId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, trainers(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async fetchTrainerAppointments(trainerId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, users!appointments_client_id_fkey(*)')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  subscribeToAppointments(userId, role, onUpdate) {
    const column = role === 'trainer' ? 'trainer_id' : 'client_id';
    return supabase
      .channel('public:appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `${column}=eq.${userId}`,
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();
  }
};
