# ⚡ BurnX - Enterprise AI Fitness & Health Platform

BurnX is a cross-platform, enterprise-grade mobile (iOS & Android) and web application designed for high-performance workout tracking, personalized nutrition macro scoring, female wellness/cycle adaptive training, live video coaching, and AI-powered fitness consultations.

---

## 🌟 Key Features

- **🤖 AI Coach & Consultation**: Real-time personalized guidance powered by Groq LLM with fallback capabilities.
- **🏋️ Workout Engine**: Custom workout split generation (Full Body, PPL, Upper/Lower, Arnold Split) with automatic Menstrual Cycle Deload and Central Nervous System (CNS) Readiness adjustments.
- **🥗 Nutrition & Macro Calculator**: Real-time Indian and Global food macro tracking (Calories, Protein, Carbs, Fats) with web lookup fallback.
- **💳 Razorpay Payment Gateway**: Standard web checkout integration supporting Weekly (₹299), Monthly (₹799), and Yearly (₹1,999) subscriptions with automatic unlock and background expiration timers.
- **📹 LiveKit Video Consultation**: High-definition 1-on-1 virtual trainer consultations with WebRTC fallback support.
- **💧 Hydration & Wellness Tracker**: Water intake monitoring, sleep score tracking, and daily midnight state resets.
- **📱 Responsive Cross-Platform**: Optimized for iOS, Android, and Web browsers (Chrome, Safari, Firefox, Edge).

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React Native (Expo SDK 54), React 19, React Native Web
- **State Management**: Zustand v5 with persistent offline storage via `@react-native-async-storage/async-storage`
- **Styling & UI**: Custom Vanilla CSS Design System, Moti animations, Expo Vector Icons
- **Backend & Database**: Express REST API, Supabase Auth & Storage
- **Payments**: Razorpay Standard Web Checkout API (`razorpay.me` & embedded modal)
- **Real-Time Video**: LiveKit WebRTC SDK

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI for Android/iOS builds (`npm install -g eas-cli`)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/dharaninivash/BurnX.git
cd BurnX

# Install dependencies
npm install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TJCVVsuabxQUKO
RAZORPAY_KEY_SECRET=mRtDWUWHjlv5b2L20R4yJobe
EXPO_PUBLIC_LIVEKIT_URL=wss://burnx-gym.livekit.cloud
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GROQ_API_KEY=gsk_your_groq_key_here
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 📱 Building & Deploying

### Local Development Server

```bash
# Start Expo development server
npm start

# Run on Web browser
npm run web
```

### Web Export & Vercel Deployment

BurnX is pre-configured for Vercel SPA deployment via `vercel.json`:

```bash
# Export static web production bundle into dist/
npx expo export --platform web
```

### Android APK & App Bundle (AAB) Generation via EAS

```bash
# Generate standalone APK for internal testing
eas build -p android --profile preview

# Generate Play Store Production App Bundle (.aab)
eas build -p android --profile production
```

---

## 🧪 Automated Testing & Audit

BurnX includes a comprehensive QA runner validating core engine formulas, subscription expiry timers, and daily reset handlers:

```bash
# Execute enterprise QA audit test runner
node scripts/qa_audit_runner.js
```

---

## 📜 License

BurnX Platform © 2026. Proprietary & Confidential. All Rights Reserved.
