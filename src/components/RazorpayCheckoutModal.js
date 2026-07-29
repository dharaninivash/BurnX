import React, { useRef } from 'react';
import { View, Modal, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function RazorpayCheckoutModal({ visible, orderId, amount, onClose, onSuccess }) {
  const webViewRef = useRef(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background-color: #f8f9fa; display: flex; justify-content: center; align-items: center; height: 100vh; }
          .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="loader" id="loader"></div>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          setTimeout(function() {
            var options = {
              "key": "${process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID}",
              "amount": "${amount}", 
              "currency": "INR",
              "name": "BurnX Premium",
              "description": "Unlock Premium Features",
              "order_id": "${orderId}",
              "handler": function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'success', data: response }));
              },
              "theme": {
                "color": "#6366f1"
              },
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
          }, 500); // short delay to ensure injected objects are ready
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.event === 'success') {
        onSuccess(message.data);
      } else if (message.event === 'dismissed') {
        onClose();
      } else if (message.event === 'failed') {
        alert('Payment Failed: ' + message.data.description);
        onClose();
      }
    } catch (e) {
      console.error('Error parsing WebView message', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Cancel Payment</Text>
          </TouchableOpacity>
        </View>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={{ flex: 1 }}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator style={styles.loader} size="large" color="#6366f1" />
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    height: 50,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  closeBtn: {
    padding: 10
  },
  closeText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 16
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20
  }
});
