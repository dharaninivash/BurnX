import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useStore } from '../../store/useStore';

// Safe dynamic require to prevent Expo Go native module crash
let LiveKitModule = null;
try {
  LiveKitModule = require('@livekit/react-native');
} catch (e) {
  console.log('LiveKit native WebRTC module not present in Expo Go. Using Interactive Consultation Fallback.');
}

const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL || 'wss://burnx-n6caqv1m.livekit.cloud';

function NativeLiveKitRoom({ navigation, token, roomName }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  
  if (!LiveKitModule || !LiveKitModule.LiveKitRoom) {
    return <FallbackConsultationRoom navigation={navigation} roomName={roomName} />;
  }

  const { LiveKitRoom, useRoomContext, VideoTrack, useLocalParticipant, useRemoteParticipants } = LiveKitModule;

  function NativeCallContent() {
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const [micMuted, setMicMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);

    useEffect(() => {
      if (localParticipant) {
        localParticipant.setMicrophoneEnabled(!micMuted);
        localParticipant.setCameraEnabled(!videoMuted);
      }
    }, [micMuted, videoMuted, localParticipant]);

    const handleEndCall = () => {
      if (room) room.disconnect();
      if (navigation && navigation.canGoBack()) {
        navigation.goBack();
      } else if (navigation) {
        navigation.navigate('Home');
      }
    };

    const remoteParticipant = remoteParticipants.length > 0 ? remoteParticipants[0] : null;
    const remoteVideoPublication = remoteParticipant?.getTrackPublications().find(p => p.kind === 'video');

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.remoteVideoArea}>
          {remoteVideoPublication?.track ? (
            <VideoTrack trackRef={{ participant: remoteParticipant, publication: remoteVideoPublication, source: 'camera' }} style={styles.remoteVideo} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="person-circle-outline" size={90} color={colors.primary} />
              <Text style={styles.remoteText}>Connected to Room: {roomName}</Text>
              <Text style={[styles.remoteText, { fontSize: 12, opacity: 0.8 }]}>Waiting for Trainer Video Stream...</Text>
            </View>
          )}
          
          <View style={styles.localVideoBox}>
            {localParticipant?.getTrackPublications().find(p => p.kind === 'video')?.track && !videoMuted ? (
              <VideoTrack trackRef={{ participant: localParticipant, source: 'camera' }} style={styles.localVideo} />
            ) : (
              <View style={styles.mutedOverlay}>
                <Ionicons name="videocam-off" size={24} color="#FFF" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.controlsArea}>
          <TouchableOpacity style={[styles.controlBtn, micMuted && styles.controlBtnActive]} onPress={() => setMicMuted(!micMuted)}>
            <Ionicons name={micMuted ? "mic-off" : "mic"} size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlBtn, videoMuted && styles.controlBtnActive]} onPress={() => setVideoMuted(!videoMuted)}>
            <Ionicons name={videoMuted ? "videocam-off" : "videocam"} size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
            <Ionicons name="call" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_URL}
      token={token}
      connect={true}
      options={{ adaptiveStream: true, dynacast: true }}
    >
      <NativeCallContent />
    </LiveKitRoom>
  );
}

// Fallback Consultation Room for Expo Go & Web Previews
function FallbackConsultationRoom({ navigation, roomName }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  const user = useStore((state) => state.user);

  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const safeGoBack = () => {
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={safeGoBack} style={{ padding: 6, marginRight: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>BURNX LIVE ({formatTime(callDuration)})</Text>
        </View>
        <Text style={styles.roomTag}>Room: {roomName}</Text>
      </View>

      {/* Main Stream Window */}
      <View style={styles.remoteVideoArea}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop' }}
          style={styles.mockStreamImage}
          resizeMode="cover"
        />

        <View style={styles.streamOverlayText}>
          <Text style={styles.coachNameText}>Coach Kabir Malhotra</Text>
          <Text style={styles.coachTitleText}>Senior Strength & Conditioning Specialist</Text>
        </View>
        
        {/* Local Self Video Box */}
        <View style={styles.localVideoBox}>
          {videoMuted ? (
            <View style={styles.mutedOverlay}>
              <Ionicons name="videocam-off" size={24} color="#FFF" />
              <Text style={{ color: '#FFF', fontSize: 10, marginTop: 4 }}>Camera Off</Text>
            </View>
          ) : (
            <View style={styles.localSelfBox}>
              <Ionicons name="person-circle" size={40} color={colors.primary} />
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold', marginTop: 2 }}>{user?.name || 'You'}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Controls Bar */}
      <View style={styles.controlsArea}>
        <TouchableOpacity style={[styles.controlBtn, micMuted && styles.controlBtnActive]} onPress={() => setMicMuted(!micMuted)}>
          <Ionicons name={micMuted ? "mic-off" : "mic"} size={26} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlBtn, videoMuted && styles.controlBtnActive]} onPress={() => setVideoMuted(!videoMuted)}>
          <Ionicons name={videoMuted ? "videocam-off" : "videocam"} size={26} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={safeGoBack}>
          <Ionicons name="call" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function VideoCall({ navigation, route }) {
  const { colors, typography, ui } = useTheme();
  const styles = getStyles(colors, typography, ui);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useStore((state) => state.user);
  
  const roomName = route?.params?.roomName || 'BurnX_Consultation';
  const participantName = user?.name || 'Client';

  useEffect(() => {
    let isMounted = true;
    const fetchToken = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:3000'}/api/livekit-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName, participantName })
        });
        const data = await response.json();
        if (isMounted) {
          if (data.token) {
            setToken(data.token);
          }
          setLoading(false);
        }
      } catch (err) {
        console.log('Token Server offline, running consultation preview mode.');
        if (isMounted) setLoading(false);
      }
    };
    fetchToken();
    return () => { isMounted = false; };
  }, [roomName, participantName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textPrimary, marginTop: 12, fontWeight: '600' }}>Initializing BurnX Consultation Channel...</Text>
      </View>
    );
  }

  if (LiveKitModule && LiveKitModule.LiveKitRoom && token) {
    return <NativeLiveKitRoom navigation={navigation} token={token} roomName={roomName} />;
  }

  return <FallbackConsultationRoom navigation={navigation} roomName={roomName} />;
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#000' },
  
  topBanner: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(233, 30, 99, 0.85)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF', marginRight: 6 },
  liveText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  roomTag: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold' },

  remoteVideoArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
  mockStreamImage: { width: '100%', height: '100%', position: 'absolute' },
  streamOverlayText: { position: 'absolute', bottom: 30, left: 20, zIndex: 15, backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 12 },
  coachNameText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  coachTitleText: { color: colors.primary, fontSize: 11, fontWeight: '700', marginTop: 2 },
  
  remoteText: { ...typography.body, color: colors.textSecondary, marginTop: 10 },
  remoteVideo: { width: '100%', height: '100%' },
  
  localVideoBox: { 
    position: 'absolute', top: 90, right: 20, width: 110, height: 150, 
    backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', borderWidth: 2, borderColor: colors.primary, zIndex: 20
  },
  localSelfBox: { justifyContent: 'center', alignItems: 'center' },
  localVideo: { width: '100%', height: '100%' },
  mutedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  
  controlsArea: { 
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', 
    paddingVertical: 25, backgroundColor: '#000', paddingBottom: 40
  },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  controlBtnActive: { backgroundColor: colors.error, borderColor: colors.error },
  endCallBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center' }
});
