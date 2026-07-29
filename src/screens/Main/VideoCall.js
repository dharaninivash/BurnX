import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useStore } from '../../store/useStore';

export default function VideoCall({ navigation, route }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  
  const roomName = route?.params?.roomName || 'BurnX HD Consultation Room';
  const trainerName = route?.params?.trainerName || 'Coach Vikram Sethi';
  
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);

  const user = useStore((state) => state.user);

  const handleEndCall = () => {
    Alert.alert('Session Concluded', 'Your consultation notes and form evaluation summary have been saved to your profile.');
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      
      {/* Remote Video Canvas */}
      <View style={styles.remoteVideoArea}>
        {!videoMuted ? (
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80' }}
            style={styles.remoteVideoImage}
          />
        ) : (
          <View style={styles.videoOffPlaceholder}>
            <Ionicons name="videocam-off" size={56} color={colors.textSecondary} />
            <Text style={styles.videoOffText}>Camera Paused</Text>
          </View>
        )}

        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>HD CALL • CONNECTED</Text>
          </View>
          <Text style={styles.roomTitle}>{roomName}</Text>
        </View>

        {/* Local Self PIP Preview */}
        <View style={styles.localPipBox}>
          <View style={styles.pipInner}>
            <Ionicons name="person-circle" size={32} color={colors.primary} />
            <Text style={styles.pipLabel}>{user?.name || 'You'}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Controls Bar */}
      <View style={styles.controlsBar}>
        <TouchableOpacity 
          style={[styles.controlBtn, micMuted && styles.controlBtnActive]} 
          onPress={() => setMicMuted(!micMuted)}
        >
          <Ionicons name={micMuted ? 'mic-off' : 'mic'} size={24} color={micMuted ? '#FFF' : colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, videoMuted && styles.controlBtnActive]} 
          onPress={() => setVideoMuted(!videoMuted)}
        >
          <Ionicons name={videoMuted ? 'videocam-off' : 'videocam'} size={24} color={videoMuted ? '#FFF' : colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, speakerEnabled && { backgroundColor: 'rgba(233, 30, 99, 0.2)' }]} 
          onPress={() => setSpeakerEnabled(!speakerEnabled)}
        >
          <Ionicons name={speakerEnabled ? 'volume-high' : 'volume-mute'} size={24} color={speakerEnabled ? colors.primary : colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <Ionicons name="call" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  remoteVideoArea: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  remoteVideoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoOffPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  videoOffText: { color: colors.textSecondary, marginTop: 10, fontSize: 14, fontWeight: '600' },
  
  topHeader: { position: 'absolute', top: 20, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 8 },
  liveBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  roomTitle: { color: '#FFF', fontSize: 12, fontWeight: '700', opacity: 0.8 },

  localPipBox: { position: 'absolute', bottom: 20, right: 20, width: 100, height: 140, borderRadius: 14, backgroundColor: 'rgba(20,20,25,0.85)', borderWidth: 1.5, borderColor: colors.primary, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', ...ui.shadow },
  pipInner: { alignItems: 'center' },
  pipLabel: { color: '#FFF', fontSize: 10, fontWeight: 'bold', marginTop: 4 },

  controlsBar: { height: 90, backgroundColor: 'rgba(15,15,20,0.95)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  controlBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  controlBtnActive: { backgroundColor: '#E53935' },
  endCallBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', ...ui.shadow }
});
