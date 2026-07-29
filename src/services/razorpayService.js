// Razorpay Client Service for direct order creation & signature verification
const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TJCVVsuabxQUKO';
const RAZORPAY_KEY_SECRET = 'mRtDWUWHjlv5b2L20R4yJobe';

export async function createRazorpayOrder(amountInPaise = 199900) {
  // 1. Try local Express backend first
  try {
    const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${backendUrl}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountInPaise }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.order_id) return data.order_id;
    }
  } catch (e) {
    // Local backend offline
  }

  // 2. Direct Razorpay API call fallback with Basic Auth
  try {
    let authHeader = '';
    if (typeof btoa !== 'undefined') {
      authHeader = 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    } else {
      authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    }

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.id) return data.id;
    }
  } catch (e) {
    if (__DEV__) console.log('Direct Razorpay API order notice:', e.message);
  }

  return null;
}
