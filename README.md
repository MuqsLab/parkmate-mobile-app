# 🚗 ParkMate – Campus Parking Mobile App

> **CSE3MAD Mobile Application Development – Assessment 4**  
> **Student:** Muqtada Al-Abbooda  
> **App Name:** ParkMate  
> **Platform:** React Native Expo Mobile App  
> **Build Type:** Android APK using EAS Build  

---

## 📌 Project Overview

> **ParkMate** is a React Native Expo mobile app prototype designed to help La Trobe University students find campus parking more easily.

The app provides parking availability information, parking details, GPS/map support, favourites, safety reminders, theme switching, testing evidence, and Android build evidence.

---

## 🎯 Problem Being Solved

Students can waste time looking for parking on campus, especially during busy study periods.

> **ParkMate solves this by helping users quickly:**
>
> - View nearby campus parking areas  
> - Check available parking spaces  
> - See walking distance  
> - Open directions to a selected car park  
> - Save favourite parking areas  
> - Use safety and device-related features  

---

## ⭐ Key Features

### 🏠 Home Screen

> Displays nearby parking areas with:
>
> - Car park name  
> - Campus zone  
> - Available spaces  
> - Walking distance  
> - Availability status  

---

### 🅿️ Parking Details Screen

> Shows detailed information for a selected car park.

Includes:

- **Speak Info**
- **Open Directions**
- **Save Favourite**
- **Send Reminder Notification**

---

### 🗺️ Map and GPS Screen

> Uses **Expo Location** to request GPS coordinates.

If browser GPS is unavailable, the app uses a safe **La Trobe University demo location fallback** so the GPS feature can still be demonstrated clearly.

---

### ⭐ Favourites Screen

> Allows users to save preferred parking areas.

The app also prevents duplicate favourites from being added.

---

### 🛡️ Safety and Device Features

> Demonstrates mobile device capability integration.

Includes:

- **Battery level**
- **Accelerometer support/fallback**
- **Safety reminder**
- **Voice safety guidance**

---

### ⚙️ Settings Screen

> Includes user preference and future integration features.

Includes:

- **Light/dark mode**
- **Firebase integration plan**
- **AdMob placeholder**

---

## 🧰 Tech Stack

> **Main technologies used in this project:**

- **React Native**
- **Expo SDK 55**
- **Expo Router**
- **TypeScript**
- **Expo Location**
- **Expo Battery**
- **Expo Sensors**
- **Expo Notifications**
- **Expo SQLite**
- **Firebase package structure**
- **Jest**
- **EAS Build**
- **Firebase Test Lab**

---

## 📁 Project Structure

```text
parkmate-mobile-app
├── __tests__
│   └── parkingUtils.test.ts
├── assets
├── scripts
├── src
│   ├── app
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── data
│   │   └── parkingData.ts
│   ├── services
│   │   ├── deviceService.ts
│   │   ├── firebaseService.ts
│   │   └── localStorageService.ts
│   ├── theme
│   │   └── theme.ts
│   └── utils
│       └── parkingUtils.ts
├── app.json
├── eas.json
├── jest.config.js
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## 🧠 Important Files

### **src/app/index.tsx**

> Main app screen and user interface.

Controls:

- App screens  
- Bottom tab navigation  
- Selected parking state  
- Favourites  
- GPS  
- Notifications  
- Speech  
- Device features  
- Theme switching  

---

### **src/app/_layout.tsx**

> Expo Router layout file.

It controls the app layout and hides the default header.

---

### **src/data/parkingData.ts**

> Stores the parking sample data.

Includes:

- Car park names  
- Zones  
- Distances  
- Available spaces  
- Total spaces  
- Notes  
- Latitude and longitude  

---

### **src/utils/parkingUtils.ts**

> Stores reusable parking logic.

Includes:

- Availability status  
- Availability colour  
- Percentage calculation  
- Duplicate favourite checking  

This file is tested using **Jest**.

---

### **src/services/deviceService.ts**

> Stores device helper functions.

Includes:

- Opening map directions  
- Showing alerts  
- Speech/text-to-speech support  

---

### **src/services/firebaseService.ts**

> Provides the planned Firebase service structure.

This file shows where future Firebase features such as **Authentication**, **Firestore**, and **Test Lab** integration would belong.

---

### **src/services/localStorageService.ts**

> Provides the planned SQLite/local storage structure.

This would be used to save favourites persistently in a full production version.

---

### **src/theme/theme.ts**

> Stores light and dark mode theme colours.

This keeps theme styling separate from the main app logic.

---

### **__tests__/parkingUtils.test.ts**

> Jest test file for the parking utility logic.

---

## ▶️ How to Run the App

### **Install dependencies**

```bash
npm install
```

### **Start Expo**

```bash
npm start
```

### **Run web preview**

```bash
npm run web
```

### **Run tests**

```bash
npm test
```

---

## ✅ Testing

### **Jest Testing**

> Jest was used to test the app’s parking utility functions.

The tests cover:

- Full parking status when no spaces are available  
- High availability status  
- Availability percentage calculation  
- Duplicate favourite prevention  
- Saving a new favourite  

### **Test Command**

```bash
npm test
```

### **Test Result**

```text
Test Suites: 1 passed
Tests: 5 passed
```

---

## 🧪 Manual Testing

> Manual testing was completed for the main user features.

Tested areas:

- **Home screen**
- **Parking Details screen**
- **Map and GPS screen**
- **Favourites screen**
- **Safety screen**
- **Settings screen**
- **Dark mode**
- **Notification fallback**
- **Open Directions feature**

---

## 📦 Android APK Build Evidence

> The project was configured for **Expo EAS Build**.

An Android internal distribution APK build was created using:

```bash
eas build -p android --profile preview
```

The `preview` profile in `eas.json` is configured to generate an APK.

### **EAS Build Result**

> **Status:** Finished  
> **Platform:** Android  
> **Build Type:** APK  
> **Distribution:** Internal  
> **SDK Version:** 55.0.0  

---

## 🔥 Firebase Test Lab Evidence

> Firebase Test Lab was used to run a Robo test on the Android APK build.

### **Robo Test Result**

```text
Device: Pixel 5
API Level: 30
Orientation: Portrait
Result: Passed
```

The Firebase crawl graph showed that the automated test explored multiple app screens and interactions.

---

## 🗂️ Sprint Development Summary

### **Sprint 1 – Core App**

Focused on:

- Creating Expo React Native project  
- Building main app screens  
- Adding bottom tab navigation  
- Passing selected parking data between screens  

---

### **Sprint 2 – Services and Testing**

Focused on:

- Firebase service structure  
- SQLite/local storage service structure  
- Parking utility functions  
- Jest test setup  
- Test execution  

---

### **Sprint 3 – Architecture and GPS**

Focused on:

- Moving parking data into a separate file  
- Moving theme colours into a separate file  
- Moving device helper logic into a service file  
- Improving GPS fallback support  
- Adding Open Directions support  

---

### **Cleanup**

Focused on:

- Removing unused Expo starter files  
- Removing unused developer-tool files  
- Improving project clarity  
- Reducing code smell  
- Making the codebase easier to explain  

---

## ⚠️ Limitations

> This is a prototype, so some features are prepared structurally but not fully connected to a production backend yet.

Current limitations:

- Parking data is sample/demo data, not live campus data  
- Firebase Authentication and Firestore are planned but not fully implemented  
- SQLite persistence is structured but not fully connected to the UI  
- Web testing has limitations for GPS and accelerometer features  
- AdMob is represented as a placeholder only  

---

## 🚀 Future Improvements

Future improvements could include:
 
- Adding Firebase Authentication for student accounts  
- Persisting favourites using SQLite  
- Expanding Firebase Test Lab testing to more devices  
- Creating a production mobile release build  

---

## 👤 Author

> **Muqtada Al-Abbooda**  
> **CSE3MAD Mobile Application Development**  
>