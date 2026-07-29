import React, { useRef, useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Linking, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export const RAZORPAY_ME_LINK = 'https://razorpay.me/@dharaninivash';

export default function RazorpayCheckoutModal({ visible, orderId, amount, onClose, onDismiss, onSuccess }) {
  const webViewRef = useRef(null);
  const handleClose = onClose || onDismiss;
  const [selectedMethod, setSelectedMethod] = useState('modal'); // 'modal' or 'link'

  const keyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TJCVVsuabxQUKO';
  const hasValidOrderId = orderId && orderId.startsWith('order_') && !orderId.startsWith('order_burnx_');

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
            <Text style={styles.subtitle}>Choose your preferred secure payment method below:</Text>
            
            {/* OPTION 1: Razorpay.me Personal Link */}
            <TouchableOpacity style={styles.optionCard} onPress={handleOpenDirectLink}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>🔗 Option 1: Pay via razorpay.me</Text>
                <Text style={styles.badgeText}>RECOMMENDED</Text>
              </View>
              <Text style={styles.optionDesc}>Instant UPI (GPay, PhonePe, Paytm), QR Code, Cards & NetBanking</Text>
            </TouchableOpacity>

            {/* OPTION 2: Razorpay Gateway */}
            <TouchableOpacity style={styles.optionCard} onPress={handleOpenDirectLink}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>💳 Option 2: Pay via Razorpay Standard Checkout</Text>
              </View>
              <Text style={styles.optionDesc}>Official Razorpay Card & Payment Modal Gateway</Text>
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

  // On Native Mobile (iOS / Android WebView):
  const orderIdField = hasValidOrderId ? `"order_id": "${orderId}",` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background-color: #0F0F14; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; color: #FFF; font-family: sans-serif; }
          .loader { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #E91E63; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .btn { background: #E91E63; color: #FFF; padding: 14px 28px; border-radius: 30px; font-weight: bold; text-decoration: none; font-size: 16px; margin-top: 15px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <p style="font-size: 16px; font-weight: 600;">Loading Secure Razorpay Gateway...</p>
        <a href="${RAZORPAY_ME_LINK}" class="btn">Pay via razorpay.me/@dharaninivash</a>

        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          setTimeout(function() {
            var options = {
              "key": "${keyId}",
              "amount": "${amount || 199900}", 
              "currency": "INR",
              "name": "BurnX Premium",
              "description": "Unlock BurnX Premium Coach & Pro Features",
              ${orderIdField}
              "handler": function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'success', data: response }));
              },
              "theme": { "color": "#E91E63" },
              "modal": {
                "ondismiss": function(){
                  window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'dismissed' }));
                }
              }
            };
            
            var rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response){
              window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'failed', data: response.error }));
            });
            rzp.open();
          }, 300);
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.event === 'success') {
        if (onSuccess) onSuccess(message.data);
      } else if (message.event === 'dismissed') {
        if (handleClose) handleClose();
      } else if (message.event === 'failed') {
        handleOpenDirectLink();
      }
    } catch (e) {
      if (__DEV__) console.log('Error parsing WebView payment message', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        
        {/* TOP METHOD SELECTOR HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitleText}>Razorpay Payment</Text>
        </View>

        {/* 2 PAYMENT OPTIONS BAR */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabItem, selectedMethod === 'modal' && styles.tabItemActive]}
            onPress={() => setSelectedMethod('modal')}
          >
            <Text style={[styles.tabText, selectedMethod === 'modal' && styles.tabTextActive]}>💳 Option 1: Checkout Page</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, selectedMethod === 'link' && styles.tabItemActive]}
            onPress={() => {
              setSelectedMethod('link');
              handleOpenDirectLink();
            }}
          >
            <Text style={[styles.tabText, selectedMethod === 'link' && styles.tabTextActive]}>🔗 Option 2: @dharaninivash Link</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT VIEW BASED ON OPTION */}
        {selectedMethod === 'modal' ? (
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        ) : (
          <View style={styles.linkViewContainer}>
            <Text style={styles.linkViewTitle}>Paying via Personal Link</Text>
            <Text style={styles.linkViewDesc}>Opening razorpay.me/@dharaninivash in browser for UPI / QR Code / NetBanking payment.</Text>
            
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
  headerTitleText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 16 },

  tabBar: { flexDirection: 'row', backgroundColor: '#14141A', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#E91E63', backgroundColor: 'rgba(233,30,99,0.08)' },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#E91E63' },

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
  optionTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  badgeText: { backgroundColor: '#E91E63', color: '#FFF', fontSize: 9, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  optionDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  confirmBtn: { width: '100%', backgroundColor: '#4CAF50', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 10, alignItems: 'center' },
  cancelBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 }
});
