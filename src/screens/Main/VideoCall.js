import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

export default function VideoCall({ navigation, route }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [callActive, setCallActive] = useState(true);
  
  // Placeholder: In a real app, this is where you'd initialize Agora Engine
  // e.g. engine = createAgoraRtcEngine();
  // engine.initialize({ appId: 'YOUR_AGORA_APP_ID' });
  // engine.joinChannel(token, channelName, null, uid);

  const handleEndCall = () => {
    setCallActive(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Video Placeholder */}
      <View style={styles.remoteVideoArea}>
        <Ionicons name="person" size={80} color={colors.surface} />
        <Text style={styles.remoteText}>Trainer (Remote Video stream)</Text>
        
        {/* Local Video Placeholder */}
        <View style={styles.localVideoBox}>
          <Ionicons name="person" size={40} color={colors.surface} />
          <Text style={styles.localText}>You</Text>
          {videoMuted && (
            <View style={styles.mutedOverlay}>
              <Ionicons name="videocam-off" size={24} color="#FFF" />
            </View>
          )}
        </View>
      </View>

      {/* Call Controls */}
      <View style={styles.controlsArea}>
        <TouchableOpacity 
          style={[styles.controlBtn, micMuted && styles.controlBtnActive]} 
          onPress={() => setMicMuted(!micMuted)}
        >
          <Ionicons name={micMuted ? "mic-off" : "mic"} size={28} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, videoMuted && styles.controlBtnActive]} 
          onPress={() => setVideoMuted(!videoMuted)}
        >
          <Ionicons name={videoMuted ? "videocam-off" : "videocam"} size={28} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <Ionicons name="call" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  remoteVideoArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
  remoteText: { ...typography.body, color: colors.textSecondary, marginTop: 10 },
  
  localVideoBox: { 
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
    width: 120, 
    height: 160, 
    backgroundColor: '#333', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border
  },
  localText: { ...typography.caption, color: colors.textSecondary, marginTop: 5 },
  mutedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  
  controlsArea: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    alignItems: 'center', 
    paddingVertical: 30, 
    backgroundColor: '#000',
    paddingBottom: 50
  },
  controlBtn: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#333', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  controlBtnActive: { backgroundColor: colors.primary },
  endCallBtn: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: '#E53935', 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});
