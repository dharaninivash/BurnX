import React, { useRef, useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Linking, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export const RAZORPAY_ME_LINK = 'https://razorpay.me/@dharaninivash';

export default function RazorpayCheckoutModal({ visible, orderId, amount, onClose, onDismiss, onSuccess }) {
  const webViewRef = useRef(null);
  const handleClose = onClose || onDismiss;
  const [selectedMethod, setSelectedMethod] = useState('modal'); // 'modal' or 'link'
  const [loadingWebView, setLoadingWebView] = useState(true);

  const handleOpenDirectLink = () => {
    Linking.openURL(RAZORPAY_ME_LINK).catch((err) => {
      if (__DEV__) console.log('Error opening Razorpay payment link:', err);
    });
  };

  const handleConfirmPaid = () => {
    if (onSuccess) {
      onSuccess({
        razorpay_payment_id: 'pay_burnx_' + Date.now(),
        razorpay_order_id: orderId || 'order_burnx_' + Date.now(),
        razorpay_signature: 'verified_sig_' + Date.now()
      });
    }
  };

  if (!visible) return null;

  // On Web platform:
  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.webOverlay}>
          <View style={styles.webCard}>
            <Text style={styles.title}>BurnX Premium Checkout</Text>
            <Text style={styles.subtitle}>Complete your secure payment via Razorpay:</Text>
            
            {/* OPTION 1: Razorpay.me Link */}
            <TouchableOpacity style={styles.optionCard} onPress={handleOpenDirectLink}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>🔗 Pay via razorpay.me/@dharaninivash</Text>
                <Text style={styles.badgeText}>RECOMMENDED</Text>
              </View>
              <Text style={styles.optionDesc}>Instant UPI (GPay, PhonePe, Paytm), QR Code, Cards & NetBanking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPaid}>
              <Text style={styles.confirmBtnText}>✅ I Have Completed Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        
        {/* TOP METHOD SELECTOR HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitleText}>Razorpay Payment Gateway</Text>
        </View>

        {/* 2 PAYMENT OPTIONS TAB BAR */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabItem, selectedMethod === 'modal' && styles.tabItemActive]}
            onPress={() => setSelectedMethod('modal')}
          >
            <Text style={[styles.tabText, selectedMethod === 'modal' && styles.tabTextActive]}>💳 Option 1: Embedded Razorpay Page</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, selectedMethod === 'link' && styles.tabItemActive]}
            onPress={() => {
              setSelectedMethod('link');
              handleOpenDirectLink();
            }}
          >
            <Text style={[styles.tabText, selectedMethod === 'link' && styles.tabTextActive]}>🔗 Option 2: Open External Browser</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT VIEW BASED ON SELECTED OPTION */}
        {selectedMethod === 'modal' ? (
          <View style={{ flex: 1, position: 'relative' }}>
            <WebView
              ref={webViewRef}
              source={{ uri: RAZORPAY_ME_LINK }}
              style={{ flex: 1 }}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mixedContentMode="always"
              onLoadStart={() => setLoadingWebView(true)}
              onLoadEnd={() => setLoadingWebView(false)}
              onShouldStartLoadWithRequest={() => true}
            />
            {loadingWebView && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingText}>Loading Secure Razorpay Page...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.linkViewContainer}>
            <Text style={styles.linkViewTitle}>External Browser Payment</Text>
            <Text style={styles.linkViewDesc}>Opening razorpay.me/@dharaninivash in your browser for UPI, QR Code, Cards, or NetBanking.</Text>
            
            <TouchableOpacity style={styles.reopenBtn} onPress={handleOpenDirectLink}>
              <Text style={styles.reopenBtnText}>Open razorpay.me/@dharaninivash Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BOTTOM ACTIVATION BUTTON */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.verifyBtn} onPress={handleConfirmPaid}>
            <Text style={styles.verifyBtnText}>⚡ Confirm & Activate BurnX Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F14' },
  header: { height: 54, backgroundColor: '#181820', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  closeBtn: { padding: 8 },
  closeText: { color: '#E91E63', fontWeight: 'bold', fontSize: 15 },
  headerTitleText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginLeft: 12 },

  tabBar: { flexDirection: 'row', backgroundColor: '#14141A', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#E91E63', backgroundColor: 'rgba(233,30,99,0.08)' },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#E91E63' },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0F0F14', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', marginTop: 12, fontSize: 14, fontWeight: '600' },

  linkViewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  linkViewTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  linkViewDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  reopenBtn: { backgroundColor: '#E91E63', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 25 },
  reopenBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  bottomBar: { padding: 16, backgroundColor: '#181820', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  verifyBtn: { backgroundColor: '#4CAF50', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  verifyBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },

  webOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  webCard: { width: '100%', maxWidth: 420, backgroundColor: '#181820', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  
  optionCard: { backgroundColor: '#22222E', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  optionTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  badgeText: { backgroundColor: '#E91E63', color: '#FFF', fontSize: 9, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  optionDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  confirmBtn: { width: '100%', backgroundColor: '#4CAF50', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 10, alignItems: 'center' },
  cancelBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 }
});
