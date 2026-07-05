/*
  ParkMate layout file

  This file controls the Expo Router layout for the app.
  It hides the default Expo header so ParkMate can use its own custom header
  inside index.tsx.

 This file:
  - _layout.tsx is the root layout file.
  - It loads the index screen.
  - headerShown false removes the default navigation bar.
*/

import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}