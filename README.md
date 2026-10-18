# Hydrilo 💧

> **A little hydration goes a long way.**  
> Build a better hydration habit, one sip at a time.

Hydrilo is a mobile hydration-tracking companion application built with **React Native**, **Expo (SDK 58)**, **Expo Router**, **Reanimated**, **React Native SVG**, and **Expo SQLite**.

---

## ✨ Features

- **Living Mascot Droplet:** Interactive, physics-based water droplet companion that reacts to touch (tap, double tap, drag, stretch/squash) and animates in real time.
- **Accurate Silhouette Liquid Fill:** Mascot's internal liquid level continuously reflects consumed hydration against daily targets using SVG silhouette clipping, dynamic waves, and rising bubbles.
- **Personalized Hydration Recommendations:** Evidence-based algorithm calculating daily hydration baseline from body weight, gender/life stage, physical activity, and climate exposure (EFSA / US National Academies guidance).
- **Intelligent Reminders:** Scheduled evenly during waking hours without interrupting sleeping hours.
- **Dual Drink Logging Modes:**
  - **Quick Add:** Instant 1-tap logging with standard beverage presets and container sizes (*Small Glass*, *Standard*, *Mug*, *Bottle*, *Flask*).
  - **Custom:** Precision intake volume input, hydration factor breakdown (e.g. coffee, tea, electrolytes), and custom notes.
- **Daily, Weekly & Monthly Progress:** Interactive bar charts, streak tracker, and goal completion rates.
- **Hydration Science Bank:** Evidence-based tips, health insights, and daily hydration reminders.
- **100% Offline-First:** Fast local SQLite database with zero cloud dependencies or tracking.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or bun
- Expo Go on Android / iOS, or Android Studio / Xcode for native runs

### Installation

```bash
git clone https://github.com/Yousufjoy/Hydrilo.git
cd Hydrilo
npm install
```

### Run the App

```bash
npx expo start
```

- Press `a` to open in Android emulator / connected device.
- Scan the QR code with **Expo Go** on Android.

---

## 🛠️ Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 58) & [React Native](https://reactnative.dev/) (0.88)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- **Graphics:** [React Native SVG](https://github.com/software-mansion/react-native-svg)
- **Local Database:** [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Language:** TypeScript
