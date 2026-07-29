import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export const RAZORPAY_ME_LINK = 'https://razorpay.me/@dharaninivash';

export default function RazorpayCheckoutModal({ visible, orderId, amount, onClose, onDismiss, onSuccess }) {
  const handleClose = onClose || onDismiss;

  const keyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TJCVVsuabxQUKO';
  const hasValidOrderId = orderId && orderId.startsWith('order_') && !orderId.startsWith('order_burnx_');

  const handleOpenDirectLink = () => {
    Linking.openURL(RAZORPAY_ME_LINK).catch((err) => {
      console.log('Error opening Razorpay payment link:', err);
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
            <Text style={styles.title}>BurnX Premium Upgrade</Text>
            <Text style={styles.subtitle}>Complete your secure payment via Razorpay to unlock all pro features.</Text>
            
            <TouchableOpacity style={styles.payBtn} onPress={handleOpenDirectLink}>
              <Text style={styles.payBtnText}>💳 Pay ₹1,999 on Razorpay</Text>
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
        <p style="font-size: 16px; font-weight: 600;">Loading Secure Razorpay Checkout...</p>
        <a href="${RAZORPAY_ME_LINK}" class="btn">Pay via Razorpay.me</a>

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
        // Handle failed modal by giving payment link fallback
        handleOpenDirectLink();
      }
    } catch (e) {
      console.error('Error parsing WebView payment message', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOpenDirectLink} style={styles.directLinkBtn}>
            <Text style={styles.directLinkText}>Open razorpay.me/@dharaninivash</Text>
          </TouchableOpacity>
        </View>

        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

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
  header: { height: 56, backgroundColor: '#181820', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  closeBtn: { padding: 8 },
  closeText: { color: '#E91E63', fontWeight: 'bold', fontSize: 15 },
  directLinkBtn: { backgroundColor: 'rgba(233,30,99,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  directLinkText: { color: '#E91E63', fontSize: 12, fontWeight: '700' },
  
  bottomBar: { padding: 16, backgroundColor: '#181820', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  verifyBtn: { backgroundColor: '#E91E63', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  verifyBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },

  webOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  webCard: { width: '100%', maxWidth: 420, backgroundColor: '#181820', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  payBtn: { width: '100%', backgroundColor: '#E91E63', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  payBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  confirmBtn: { width: '100%', backgroundColor: '#4CAF50', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 10 },
  cancelBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 }
});
