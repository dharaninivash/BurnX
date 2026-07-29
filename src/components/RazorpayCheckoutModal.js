import React, { useRef, useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Linking, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export const RAZORPAY_ME_LINK = 'https://razorpay.me/@dharaninivash';

export default function RazorpayCheckoutModal({ visible, orderId, amount, onClose, onDismiss, onSuccess }) {
  const webViewRef = useRef(null);
  const handleClose = onClose || onDismiss;
  const [loadingWebView, setLoadingWebView] = useState(true);

  const keyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TJCVVsuabxQUKO';
  const amountVal = amount || 199900;
  const priceFormatted = `₹${(amountVal / 100).toLocaleString('en-IN')}`;

  const handleOpenDirectLink = () => {
    Linking.openURL(RAZORPAY_ME_LINK).catch((err) => {
      if (__DEV__) console.log('Error opening Razorpay payment link:', err);
    });
  };

  if (!visible) return null;

  const orderIdField = orderId ? `"order_id": "${orderId}",` : '';

  // HTML content rendering Razorpay Standard Web Checkout modal with exact plan amount
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background-color: #0F0F14; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; color: #FFF; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; }
          .loader { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #E91E63; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #FFF; }
          .amount-tag { background: rgba(233, 30, 99, 0.2); color: #E91E63; font-size: 22px; font-weight: 900; padding: 8px 20px; border-radius: 20px; margin-bottom: 20px; border: 1px solid #E91E63; display: inline-block; }
          .btn { background: #E91E63; color: #FFF; padding: 14px 28px; border-radius: 30px; font-weight: bold; text-decoration: none; font-size: 16px; margin-top: 15px; display: inline-block; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <div class="title">BurnX Premium Plan Checkout</div>
        <div class="amount-tag">${priceFormatted}</div>
        <p style="font-size: 14px; color: #AAA; max-width: 80%;">Launching Secure Razorpay Gateway for ${priceFormatted}...</p>
        <button onclick="openRazorpay()" class="btn">Pay ${priceFormatted} Now</button>

        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          function openRazorpay() {
            var options = {
              "key": "${keyId}",
              "amount": "${amountVal}", 
              "currency": "INR",
              "name": "BurnX Premium",
              "description": "Unlock BurnX Premium AI Coach (${priceFormatted})",
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
          }

          setTimeout(openRazorpay, 400);
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
      }
    } catch (e) {
      if (__DEV__) console.log('Error parsing WebView payment message', e);
    }
  };

  // On Web platform:
  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.webOverlay}>
          <View style={styles.webCard}>
            <Text style={styles.title}>BurnX Premium Checkout</Text>
            <Text style={styles.subtitle}>Pay exact plan amount of {priceFormatted} via Razorpay:</Text>
            
            <TouchableOpacity style={styles.optionCard} onPress={handleOpenDirectLink}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>💳 Pay {priceFormatted} via Razorpay</Text>
                <Text style={styles.badgeText}>SECURE</Text>
              </View>
              <Text style={styles.optionDesc}>Instant UPI (GPay, PhonePe, Paytm), QR Code, Cards & NetBanking</Text>
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
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitleText}>Razorpay Payment ({priceFormatted})</Text>
          </View>
        </View>

        {/* WEBVIEW CHECKOUT */}
        <View style={{ flex: 1, position: 'relative' }}>
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent, baseUrl: 'https://checkout.razorpay.com' }}
            onMessage={handleMessage}
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
              <Text style={styles.loadingText}>Loading Razorpay Gateway for {priceFormatted}...</Text>
            </View>
          )}
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
  headerTitleBox: { flex: 1, alignItems: 'center', marginRight: 40 },
  headerTitleText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0F0F14', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', marginTop: 12, fontSize: 14, fontWeight: '600' },

  webOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  webCard: { width: '100%', maxWidth: 420, backgroundColor: '#181820', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  
  optionCard: { backgroundColor: '#22222E', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  optionTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  badgeText: { backgroundColor: '#E91E63', color: '#FFF', fontSize: 9, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  optionDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  cancelBtn: { padding: 10, alignItems: 'center' },
  cancelBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 }
});
