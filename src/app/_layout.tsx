// SECTION: Expo Router layout
// This file controls the overall navigation shell for the app.
// ParkMate currently uses one main screen, index.tsx, because the prototype
// handles tab switching manually inside the main app component.
// headerShown: false removes the default Expo header so the custom ParkMate
// header and bottom navigation are visible.

import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}