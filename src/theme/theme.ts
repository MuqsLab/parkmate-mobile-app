/*
  ParkMate theme file

  This file stores all light mode and dark mode colours in one place.
  Keeping the theme separate makes the app easier to maintain because colours
  are not hard-coded across the whole app.

  THIS file:
  - This file controls the main visual style.
  - index.tsx imports these colours and uses them for cards, text, buttons, and backgrounds.
*/

export type AppTheme = {
  bg: string;
  surface: string;
  card: string;
  cardAlt: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentDark: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  white: string;
  shadow: string;
};

export function getAppTheme(darkMode: boolean): AppTheme {
  if (darkMode) {
    return {
      bg: '#0B1220',
      surface: '#111827',
      card: '#1E293B',
      cardAlt: '#162033',
      text: '#F8FAFC',
      muted: '#CBD5E1',
      border: '#334155',
      accent: '#3B82F6',
      accentDark: '#2563EB',
      accentSoft: '#1E3A8A',
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
      white: '#FFFFFF',
      shadow: '#000000',
    };
  }

  return {
    bg: '#EEF6FF',
    surface: '#F8FAFC',
    card: '#FFFFFF',
    cardAlt: '#F1F5F9',
    text: '#0F172A',
    muted: '#475569',
    border: '#CBD5E1',
    accent: '#2563EB',
    accentDark: '#1D4ED8',
    accentSoft: '#DBEAFE',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    white: '#FFFFFF',
    shadow: '#64748B',
  };
}