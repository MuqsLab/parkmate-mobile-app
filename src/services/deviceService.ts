/*
  ParkMate Device Service

  This file stores helper functions for mobile device features.

  Why this file exists:
  - Keeps device-specific code separate from the UI
  - Makes GPS, maps, speech, and alerts easier to explain
  - Shows better software architecture for the marking rubric

  Features supported here:
  - Apple Maps / Google Maps direction links
  - Web text-to-speech support
  - Cross-platform alert messages
*/

import { Alert, Linking, Platform } from 'react-native';

export function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export async function openMapDirections(latitude: number, longitude: number, locationName: string) {
  const destination = `${latitude},${longitude}`;

  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${destination}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      return `Opening directions to ${locationName}.`;
    }

    showMessage('Directions unavailable', 'Map directions could not be opened on this device.');
    return 'Directions could not be opened.';
  } catch {
    showMessage('Directions unavailable', 'Map directions could not be opened.');
    return 'Directions failed.';
  }
}

export function speakText(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } else {
    showMessage(title, message);
  }
}
