import React, { useEffect, useRef } from 'react';
import { View, Modal, ActivityIndicator, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function RazorpayCheckoutModal({ visible, orderId, amount, onClose, onDismiss, onSuccess }) {
  const webViewRef = useRef(null);
  const handleClose = onClose || onDismiss;

  const keyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TJCVVsuabxQUKO';

  // Handle direct Web browser execution
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      if (typeof window !== 'undefined') {
        const loadScriptAndOpen = () => {
          if (!window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => openRazorpayModal();
            document.body.appendChild(script);
          } else {
            openRazorpayModal();
          }
        };

        const openRazorpayModal = () => {
          const options = {
            key: keyId,
            amount: amount,
            currency: 'INR',
            name: 'BurnX Premium',
            description: 'Unlock BurnX Premium Coach & Pro Features',
            order_id: orderId,
            handler: function (response) {
              if (onSuccess) onSuccess(response);
            },
            theme: { color: '#E91E63' },
            modal: {
              ondismiss: function () {
                if (handleClose) handleClose();
              }
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        };

        loadScriptAndOpen();
      }
    }
  }, [visible, orderId, amount]);

  if (Platform.OS === 'web') {
    return null; // Razorpay modal opens natively in web browser via script injection
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background-color: #0F0F14; display: flex; justify-content: center; align-items: center; height: 100vh; color: #FFF; font-family: sans-serif; }
          .loader { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #E91E63; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="loader" id="loader"></div>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          setTimeout(function() {
            var options = {
              "key": "${keyId}",
              "amount": "${amount}", 
              "currency": "INR",
              "name": "BurnX Premium",
              "description": "Unlock BurnX Premium Coach & Pro Features",
              "order_id": "${orderId}",
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
          }, 400);
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
        alert('Payment Failed: ' + (message.data?.description || 'Transaction declined'));
        if (handleClose) handleClose();
      }
    } catch (e) {
      console.error('Error parsing WebView payment event', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ Cancel Payment</Text>
          </TouchableOpacity>
        </View>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={{ flex: 1 }}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator style={styles.loader} size="large" color="#E91E63" />
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F14' },
  header: { height: 54, backgroundColor: '#181820', justifyContent: 'center', alignItems: 'flex-start', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  closeBtn: { padding: 8 },
  closeText: { color: '#E91E63', fontWeight: 'bold', fontSize: 15 },
  loader: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -20 }
});
