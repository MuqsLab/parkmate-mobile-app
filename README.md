# 🚗 ParkMate – Campus Parking Mobile App

> **CSE3MAD Mobile Application Development**  
> **Student:** Muqtada Al-Abbooda  
> **App Name:** ParkMate  
> **Platform:** React Native Expo Mobile App  
> **Project Type:** Mobile app prototype with supplementary advanced feature  
> **New Feature:** Context-Aware Parking Analytics with Graphs and Smart Parking Planner  

---

## 📌 Project Overview

**ParkMate** is a React Native Expo mobile app prototype designed to help La Trobe University students find campus parking more easily.

The app provides parking availability information, parking details, GPS/map support, favourites, safety reminders, theme switching, testing evidence, Android build evidence, and a supplementary advanced analytics feature.

For the new feature, ParkMate was extended with **Context-Aware Parking Analytics with Graphs and a Smart Parking Planner**. This feature uses weekly parking data, user input, graph visualisation, and recommendation logic to help students plan where and when to park before arriving at La Trobe Bundoora.

---

## 🎯 Problem Being Solved

Students can waste time looking for parking on campus, especially during busy study periods.

**ParkMate helps users:**

- View nearby campus parking areas
- Check available parking spaces
- See walking distance
- Open directions to a selected car park
- Save favourite parking areas
- Use safety and device-related features
- Analyse weekly parking trends
- Receive a smart parking recommendation based on day, time, and preference

---

## 🧠 New Assessment 3 Feature

### 📊 Context-Aware Parking Analytics with Graphs and Smart Parking Planner

This feature was selected from the **Graphs** example area listed in the Assessment 3 task instructions and was adapted to fit the ParkMate project.

The feature is designed to help students make better parking decisions before travelling to campus.

### What the user can do

The user selects:

- Day coming to campus
- Arrival time
- Parking preference

The app then returns:

- Recommended car park
- Risk level
- Reason for the recommendation
- Planner confidence score
- Availability score
- Time suitability score
- Preference match score

### Graphs included

The Analytics screen includes:

- Weekly Availability Line Graph
- Weekly Availability Bar Graph
- Weekly Graph Summary
- Car Park Average Comparison

The line graph shows the weekly trend, while the bar graph keeps the data readable and accessible with clear percentage values.

### Why this feature is useful

The feature is relevant because ParkMate is a campus parking app. Students may not only want to know current parking availability, but also when parking is usually busy and which car park may be a better option.

This turns ParkMate from a basic parking information app into a more useful planning tool.

---

## ⭐ Key Features

### 🏠 Home Screen

Displays nearby parking areas with:

- Car park name
- Campus zone
- Available spaces
- Walking distance
- Availability status

---

### 🅿️ Parking Details Screen

Shows detailed information for a selected car park.

Includes:

- Speak Info
- Open Directions
- Save Favourite
- Send Reminder Notification

---

### 🗺️ Map and GPS Screen

Uses **Expo Location** to request GPS coordinates.

If browser GPS is unavailable, the app uses a safe **La Trobe University demo location fallback** so the GPS feature can still be demonstrated clearly.

---

### 📊 Analytics Screen

The Analytics screen contains the supplementary Assessment 3 feature.

Includes:

- Smart Parking Planner
- User input buttons for day, arrival time, and parking preference
- Smart Parking Plan result
- Risk level
- Planner Score Breakdown
- Weekly Availability Line Graph
- Weekly Availability Bar Graph
- Weekly Graph Summary
- Car Park Average Comparison

---

### ⭐ Favourites Screen

Allows users to save preferred parking areas.

The app also prevents duplicate favourites from being added.

---

### 🛡️ Safety and Device Features

Demonstrates mobile device capability integration.

Includes:

- Battery level
- Accelerometer support/fallback
- Safety reminder
- Voice safety guidance

---

### ⚙️ Settings Screen

Includes user preference and future integration features.

Includes:

- Light/dark mode
- Firebase integration plan
- AdMob placeholder

---

## 🧰 Tech Stack

Main technologies used in this project:

- React Native
- Expo SDK 55
- Expo Router
- TypeScript
- Node.js / NPM
- Expo Location
- Expo Battery
- Expo Sensors
- Expo Notifications
- Expo SQLite
- Firebase package structure
- Jest
- EAS Build
- Firebase Test Lab
- react-native-chart-kit
- react-native-svg

---

## 📦 NPM Packages for The New Feature

The graph feature uses graph-related package support.

Important packages include:

```text
react-native-chart-kit
react-native-svg

## 👤 Author > **Muqtada Al-Abbooda** > **CSE3MAD Mobile Application Development** >
