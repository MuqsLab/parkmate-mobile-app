/*
  ParkMate Theme File

  This file stores the light and dark mode colour values.

  Why this file exists:
  - Keeps colours separate from screen logic
  - Makes dark mode easier to explain and maintain
  - Helps avoid repeated hard-coded colours across the app
*/

export function getAppTheme(darkMode: boolean) {
  return {
    bg: darkMode ? '#0f172a' : '#eef6ff',
    card: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#0f172a',
    muted: darkMode ? '#cbd5e1' : '#475569',
    border: darkMode ? '#334155' : '#cbd5e1',
    accent: '#2563eb',
    softAccent: darkMode ? '#1e3a8a' : '#dbeafe',
  };
}
