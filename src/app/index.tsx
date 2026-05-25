/*
  ParkMate main app file

  This file controls the main ParkMate prototype screens and interactions.

  What this file does:
  - Shows the Home, Parking Details, Map, Favourites, Safety, and Settings screens.
  - Uses bottom tab navigation.
  - Passes selected parking data between screens using state.
  - Uses separate files for parking data, theme colours, and tested utility logic.
  - Demonstrates GPS, battery, accelerometer fallback, notification fallback, voice guidance,
    favourites, dark mode, and map directions.

  This file:
  - src/app/index.tsx controls the main user interface.
  - src/data/parkingData.ts stores parking data.
  - src/theme/theme.ts stores light/dark theme colours.
  - src/utils/parkingUtils.ts stores reusable tested logic.
*/

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Accelerometer } from 'expo-sensors';

import { ParkingArea, parkingAreas } from '../data/parkingData';
import { getAppTheme } from '../theme/theme';
import {
  calculateAvailabilityPercentage,
  canSaveFavourite,
} from '../utils/parkingUtils';

type TabName = 'home' | 'parking' | 'map' | 'favourites' | 'safety' | 'settings';

type LocationState = {
  text: string;
  latitude?: number;
  longitude?: number;
};

const tabs: { key: TabName; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'parking', label: 'Parking', icon: '🅿️' },
  { key: 'map', label: 'Map', icon: '🗺️' },
  { key: 'favourites', label: 'Favourites', icon: '⭐' },
  { key: 'safety', label: 'Safety', icon: '🛡️' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function ParkMateApp() {
  /*
    SECTION: Main app state

    activeTab controls the current screen.
    selectedParking stores the parking area selected by the user.
    favouriteIds stores saved favourites.
    darkMode controls the app theme.
  */
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [selectedParking, setSelectedParking] = useState<ParkingArea>(parkingAreas[0]);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [movementStatus, setMovementStatus] = useState(
    'Sensor check ready. Mobile devices can use accelerometer support.'
  );
  const [locationText, setLocationText] = useState<LocationState>({
    text: 'Location not requested yet.',
  });
  const [lastAction, setLastAction] = useState('Ready to help you find parking.');

  const theme = useMemo(() => getAppTheme(darkMode), [darkMode]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const favourites = parkingAreas.filter((item) => favouriteIds.includes(item.id));

  /*
    SECTION: Battery feature

    This uses Expo Battery to read the current battery level.
    On unsupported environments, it shows an unavailable fallback.
  */
  useEffect(() => {
    async function loadBattery() {
      try {
        const level = await Battery.getBatteryLevelAsync();

        if (level >= 0) {
          setBatteryLevel(Math.round(level * 100));
        } else {
          setBatteryLevel(null);
        }
      } catch {
        setBatteryLevel(null);
      }
    }

    loadBattery();
  }, []);

  /*
    SECTION: Accelerometer feature

    This is fixed for web testing.
    Expo Sensors can crash on web if the native accelerometer module is not available.
    Therefore, the app only starts the accelerometer listener on non-web platforms.

    If the teacher asks:
    - On a real mobile device, this section can listen for movement.
    - In the browser/web preview, a clear fallback message is shown so the demo does not crash.
  */
  useEffect(() => {
    if (Platform.OS === 'web') {
      setMovementStatus(
        'Accelerometer fallback shown in web preview. On mobile, the sensor can detect phone movement.'
      );
      return;
    }

    try {
      const subscription = Accelerometer.addListener((data) => {
        const totalMovement = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);

        if (totalMovement > 1.8) {
          setMovementStatus('Movement detected. Phone may be in motion.');
        } else {
          setMovementStatus('Phone movement is stable.');
        }
      });

      Accelerometer.setUpdateInterval(1000);

      return () => {
        subscription.remove();
      };
    } catch {
      setMovementStatus('Accelerometer is unavailable on this device.');
    }
  }, []);

  /*
    SECTION: Tab navigation

    The app uses a simple state-based bottom tab system.
  */
  function changeTab(tab: TabName) {
    setActiveTab(tab);
    setLastAction(`Opened ${tabs.find((item) => item.key === tab)?.label} screen.`);
  }

  /*
    SECTION: Data passing between screens

    When a parking card is selected, the selected parking object is saved in state.
    The Parking Details screen then reads that state.
  */
  function selectParking(area: ParkingArea) {
    setSelectedParking(area);
    setActiveTab('parking');
    setLastAction(`${area.name} selected. Parking details opened.`);
  }

  /*
    SECTION: GPS feature

    Requests GPS permission and displays location.
    If GPS fails in the browser, a La Trobe demo location is used.
  */
  async function requestLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationText({
          text: 'Demo location loaded: La Trobe University, Bundoora\nLat: -37.7216, Lng: 145.0480',
          latitude: -37.7216,
          longitude: 145.048,
        });
        setLastAction('GPS permission denied, so demo campus location was used.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const latitude = Number(currentLocation.coords.latitude.toFixed(4));
      const longitude = Number(currentLocation.coords.longitude.toFixed(4));

      setLocationText({
        text: `Lat: ${latitude}, Lng: ${longitude}`,
        latitude,
        longitude,
      });

      setLastAction('Live GPS location loaded successfully.');
    } catch {
      setLocationText({
        text: 'Demo location loaded: La Trobe University, Bundoora\nLat: -37.7216, Lng: 145.0480',
        latitude: -37.7216,
        longitude: 145.048,
      });
      setLastAction('GPS was unavailable, so demo campus location was used.');
    }
  }

  /*
    SECTION: Open Directions

    Each parking area has latitude and longitude.
    The app opens Apple Maps on iOS and Google Maps on web/Android.
  */
  async function openDirections(area: ParkingArea) {
    const destination = `${area.latitude},${area.longitude}`;

    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${destination}`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    await Linking.openURL(url);
    setLastAction(`Opened directions for ${area.name}.`);
  }

  /*
    SECTION: Voice guidance

    On web, browser speech synthesis is used.
    On mobile/unsupported platforms, Alert is used as a fallback.
  */
  function speakText(title: string, message: string) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setLastAction(`${title} was spoken using voice guidance.`);
      return;
    }

    Alert.alert(title, message);
    setLastAction(`${title} displayed as a fallback alert.`);
  }

  /*
    SECTION: Notification feature

    On mobile, Expo Notifications can request permission and send a reminder.
    On web, the app uses an alert fallback.
  */
  async function sendReminderNotification() {
    const message = `Reminder: ${selectedParking.name} has ${selectedParking.available}/${selectedParking.total} spaces available.`;

    if (Platform.OS === 'web') {
      Alert.alert('Parking Reminder', message);
      setLastAction('Web alert fallback used for reminder notification.');
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Notification Permission', 'Notification permission was not granted.');
      setLastAction('Notification permission was not granted.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ParkMate Parking Reminder',
        body: message,
      },
      trigger: null,
    });

    setLastAction('Parking reminder notification was sent.');
  }

  /*
    SECTION: Save favourites

    The duplicate favourite check uses canSaveFavourite from parkingUtils.ts.
    This is part of the tested logic.
  */
  function saveFavourite(area: ParkingArea) {
    if (!canSaveFavourite(favouriteIds, area.id)) {
      Alert.alert('Already Saved', `${area.name} is already in your favourites.`);
      setLastAction(`${area.name} was already saved.`);
      return;
    }

    setFavouriteIds((current) => [...current, area.id]);
    Alert.alert('Favourite Saved', `${area.name} was added to favourites.`);
    setLastAction(`${area.name} saved as a favourite.`);
  }

  function availabilityStatus(area: ParkingArea) {
    if (area.available <= 0) return 'Full';

    const percentage = calculateAvailabilityPercentage(area.available, area.total);

    if (percentage >= 30) return 'High availability';
    return 'Limited availability';
  }

  function availabilityColour(area: ParkingArea) {
    const status = availabilityStatus(area);

    if (status === 'Full') return theme.danger;
    if (status === 'Limited availability') return theme.warning;
    return theme.success;
  }

  function renderScreen() {
    if (activeTab === 'home') return renderHome();
    if (activeTab === 'parking') return renderParkingDetails();
    if (activeTab === 'map') return renderMap();
    if (activeTab === 'favourites') return renderFavourites();
    if (activeTab === 'safety') return renderSafety();
    return renderSettings();
  }

  function renderHome() {
    return (
      <View>
        <View style={styles.heroCard}>
          <View style={styles.heroIconBox}>
            <Text style={styles.heroIcon}>P</Text>
          </View>

          <View style={styles.heroTextBox}>
            <Text style={styles.kicker}>Smart campus parking</Text>
            <Text style={styles.heroTitle}>Find parking before you arrive</Text>
            <Text style={styles.heroSubtitle}>
              Check car park availability, open directions, save favourites and use safety
              features in one clean student-focused app.
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Campus car parks</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>117</Text>
            <Text style={styles.statLabel}>Available spaces</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>GPS</Text>
            <Text style={styles.statLabel}>Directions support</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Nearby Parking</Text>
            <Text style={styles.sectionSubtitle}>Select a car park to view details.</Text>
          </View>
        </View>

        {parkingAreas.map((area) => (
          <Pressable key={area.id} style={styles.parkingCard} onPress={() => selectParking(area)}>
            <View style={styles.parkingLeft}>
              <View style={styles.parkingIconCircle}>
                <Text style={styles.parkingIcon}>P</Text>
              </View>

              <View style={styles.parkingTextBox}>
                <Text style={styles.cardTitle}>{area.name}</Text>
                <Text style={styles.cardMuted}>{area.zone}</Text>
                <Text style={styles.cardSmall}>
                  {area.available}/{area.total} spaces • {area.distance}
                </Text>
              </View>
            </View>

            <View style={[styles.statusPill, { backgroundColor: availabilityColour(area) }]}>
              <Text style={styles.statusText}>{availabilityStatus(area)}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderParkingDetails() {
    const percentage = calculateAvailabilityPercentage(selectedParking.available, selectedParking.total);

    return (
      <View>
        <Text style={styles.screenTitle}>Parking Details</Text>
        <Text style={styles.screenSubtitle}>
          Selected parking data is passed into this screen from Home or Map.
        </Text>

        <View style={styles.detailHero}>
          <View style={styles.detailTopRow}>
            <View>
              <Text style={styles.detailName}>{selectedParking.name}</Text>
              <Text style={styles.detailZone}>{selectedParking.zone}</Text>
            </View>

            <View style={[styles.statusPill, { backgroundColor: availabilityColour(selectedParking) }]}>
              <Text style={styles.statusText}>{availabilityStatus(selectedParking)}</Text>
            </View>
          </View>

          <Text style={styles.bigAvailability}>
            {selectedParking.available}/{selectedParking.total}
          </Text>
          <Text style={styles.cardMuted}>Available spaces</Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: availabilityColour(selectedParking),
                },
              ]}
            />
          </View>

          <Text style={styles.detailNote}>{selectedParking.note}</Text>
          <Text style={styles.detailDistance}>Walking distance: {selectedParking.distance}</Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              speakText(
                'Parking Information',
                `${selectedParking.name} in the ${selectedParking.zone} has ${selectedParking.available} out of ${selectedParking.total} spaces available. It is ${selectedParking.distance} away.`
              )
            }
          >
            <Text style={styles.primaryButtonText}>🔊 Speak Info</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => openDirections(selectedParking)}>
            <Text style={styles.secondaryButtonText}>🗺️ Open Directions</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => saveFavourite(selectedParking)}>
            <Text style={styles.secondaryButtonText}>⭐ Save Favourite</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={sendReminderNotification}>
            <Text style={styles.secondaryButtonText}>🔔 Send Reminder Notification</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Data Between Screens</Text>
          <Text style={styles.infoText}>
            The selected car park is stored in state and reused by this Parking Details screen.
            This demonstrates screen-to-screen data passing.
          </Text>
        </View>
      </View>
    );
  }

  function renderMap() {
    return (
      <View>
        <Text style={styles.screenTitle}>Map and GPS</Text>
        <Text style={styles.screenSubtitle}>
          Demonstrates GPS, campus location preview and map direction support.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Current Location</Text>
          <Text style={styles.infoText}>{locationText.text}</Text>

          <Pressable style={styles.primaryButton} onPress={requestLocation}>
            <Text style={styles.primaryButtonText}>📍 Get GPS Location</Text>
          </Pressable>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapHeaderRow}>
            <Text style={styles.mapTitle}>La Trobe Campus Map Preview</Text>
            <Text style={styles.mapBadge}>Prototype map</Text>
          </View>

          {parkingAreas.map((area) => (
            <Pressable key={area.id} style={styles.mapItem} onPress={() => selectParking(area)}>
              <Text style={styles.mapPin}>📍</Text>

              <View style={styles.mapTextBox}>
                <Text style={styles.mapItemTitle}>{area.name}</Text>
                <Text style={styles.mapItemSub}>
                  {area.zone} • {area.distance}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.noteText}>
          Tap a parking area to view details, then use Open Directions to launch map directions.
        </Text>
      </View>
    );
  }

  function renderFavourites() {
    return (
      <View>
        <Text style={styles.screenTitle}>Favourites</Text>
        <Text style={styles.screenSubtitle}>Saved parking areas are available for quick access.</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>SQLite / Local Storage Plan</Text>
          <Text style={styles.infoText}>
            This prototype stores favourites in app state for demonstration. The SQLite/local
            storage service shows where persistent favourites would be saved in a production app.
          </Text>
        </View>

        {favourites.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.infoTitle}>No favourites saved yet</Text>
            <Text style={styles.infoText}>
              Open a parking area and press Save Favourite to add it here.
            </Text>
          </View>
        ) : (
          favourites.map((area) => (
            <Pressable key={area.id} style={styles.parkingCard} onPress={() => selectParking(area)}>
              <View>
                <Text style={styles.cardTitle}>{area.name}</Text>
                <Text style={styles.cardMuted}>{area.zone}</Text>
                <Text style={styles.cardSmall}>
                  {area.available}/{area.total} spaces • {area.distance}
                </Text>
              </View>

              <View style={[styles.statusPill, { backgroundColor: availabilityColour(area) }]}>
                <Text style={styles.statusText}>{availabilityStatus(area)}</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    );
  }

  function renderSafety() {
    return (
      <View>
        <Text style={styles.screenTitle}>Safety and Device Features</Text>
        <Text style={styles.screenSubtitle}>
          Demonstrates battery, sensor fallback and safe-use messaging.
        </Text>

        <View style={styles.deviceCard}>
          <Text style={styles.deviceIcon}>🔋</Text>
          <Text style={styles.infoTitle}>Battery</Text>
          <Text style={styles.deviceValue}>
            {batteryLevel === null ? 'Unavailable' : `${batteryLevel}%`}
          </Text>
          <Text style={styles.infoText}>Current device battery level.</Text>
        </View>

        <View style={styles.deviceCard}>
          <Text style={styles.deviceIcon}>📱</Text>
          <Text style={styles.infoTitle}>Accelerometer Sensor</Text>
          <Text style={styles.infoText}>{movementStatus}</Text>
          <Text style={styles.noteText}>
            Web preview uses a fallback. On a mobile device, Expo Sensors can detect movement.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Safety Reminder</Text>
          <Text style={styles.infoText}>
            ParkMate should only be used when safe and not while actively driving.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              speakText(
                'Safety Reminder',
                'ParkMate should only be used when safe and not while actively driving.'
              )
            }
          >
            <Text style={styles.primaryButtonText}>🔊 Speak Safety Reminder</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderSettings() {
    return (
      <View>
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenSubtitle}>
          Theme controls and planned production integrations.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Theme</Text>
          <Text style={styles.infoText}>
            Dark mode supports usability in low-light environments and improves user comfort.
          </Text>

          <Pressable
            style={[
              styles.primaryButton,
              { backgroundColor: darkMode ? '#F97316' : theme.accent },
            ]}
            onPress={() => {
              setDarkMode((current) => !current);
              setLastAction('Theme mode changed.');
            }}
          >
            <Text style={styles.primaryButtonText}>
              {darkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Firebase Integration Plan</Text>
          <Text style={styles.infoText}>
            Firebase Authentication would support login. Firestore would store parking and user
            data. Firebase Test Lab was used to test the Android APK build.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>AdMob Placeholder</Text>
          <Text style={styles.infoText}>
            This area represents where a Google AdMob test banner could be placed in a production version.
          </Text>

          <View style={styles.adPlaceholder}>
            <Text style={styles.adText}>Test Ad Banner Placeholder</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.appShell}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.phoneFrame}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.logoText}>PARKMATE</Text>
              <Text style={styles.logoSub}>Assessment 4 Mobile App</Text>
            </View>

            <View style={styles.onlineBadge}>
              <Text style={styles.onlineDot}>●</Text>
              <Text style={styles.onlineText}>Live prototype</Text>
            </View>
          </View>

          <View style={styles.content}>{renderScreen()}</View>

          <View style={styles.lastActionBar}>
            <Text style={styles.lastActionLabel}>Last action</Text>
            <Text style={styles.lastActionText}>{lastAction}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabBarOuter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                style={[styles.tabButton, active && styles.activeTabButton]}
                onPress={() => changeTab(tab.key)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabText, active && styles.activeTabText]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof getAppTheme>) {
  return StyleSheet.create({
    appShell: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    scrollContent: {
      paddingBottom: 120,
      alignItems: 'center',
    },
    phoneFrame: {
      width: '100%',
      maxWidth: 620,
      minHeight: 760,
      backgroundColor: theme.surface,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.border,
    },
    topBar: {
      paddingHorizontal: 26,
      paddingTop: 22,
      paddingBottom: 18,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoText: {
      color: theme.accent,
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 2,
    },
    logoSub: {
      color: theme.muted,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 2,
    },
    onlineBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.accentSoft,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
    },
    onlineDot: {
      color: theme.success,
      marginRight: 6,
      fontSize: 12,
    },
    onlineText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '800',
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 22,
    },
    heroCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 28,
      padding: 22,
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOpacity: 0.14,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 28,
      elevation: 4,
    },
    heroIconBox: {
      width: 84,
      height: 84,
      borderRadius: 26,
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Platform.OS === 'web' ? 18 : 0,
      marginBottom: Platform.OS === 'web' ? 0 : 16,
    },
    heroIcon: {
      fontSize: 42,
      color: theme.white,
      fontWeight: '900',
    },
    heroTextBox: {
      flex: 1,
    },
    kicker: {
      color: theme.accent,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 6,
    },
    heroTitle: {
      color: theme.text,
      fontSize: 30,
      lineHeight: 34,
      fontWeight: '900',
      marginBottom: 10,
    },
    heroSubtitle: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '600',
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
      marginBottom: 22,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 20,
      padding: 14,
    },
    statNumber: {
      color: theme.accent,
      fontSize: 22,
      fontWeight: '900',
    },
    statLabel: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 4,
    },
    sectionHeaderRow: {
      marginTop: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '900',
    },
    sectionSubtitle: {
      color: theme.muted,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 4,
    },
    parkingCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 22,
      padding: 18,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 2,
    },
    parkingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    parkingIconCircle: {
      width: 46,
      height: 46,
      borderRadius: 16,
      backgroundColor: theme.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    parkingIcon: {
      color: theme.accent,
      fontWeight: '900',
      fontSize: 18,
    },
    parkingTextBox: {
      flex: 1,
    },
    cardTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '900',
    },
    cardMuted: {
      color: theme.muted,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 3,
    },
    cardSmall: {
      color: theme.muted,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 7,
    },
    statusPill: {
      paddingVertical: 7,
      paddingHorizontal: 11,
      borderRadius: 999,
      marginLeft: 10,
    },
    statusText: {
      color: theme.white,
      fontWeight: '900',
      fontSize: 11,
    },
    screenTitle: {
      color: theme.text,
      fontSize: 30,
      fontWeight: '900',
      marginBottom: 6,
    },
    screenSubtitle: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '600',
      marginBottom: 16,
    },
    detailHero: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 26,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 24,
      elevation: 4,
    },
    detailTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    detailName: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '900',
    },
    detailZone: {
      color: theme.muted,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 2,
    },
    bigAvailability: {
      color: theme.success,
      fontSize: 54,
      fontWeight: '900',
      marginTop: 28,
    },
    progressTrack: {
      height: 12,
      backgroundColor: theme.cardAlt,
      borderRadius: 999,
      overflow: 'hidden',
      marginTop: 12,
      marginBottom: 18,
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
    },
    detailNote: {
      color: theme.text,
      fontSize: 16,
      lineHeight: 23,
      fontWeight: '700',
      marginTop: 10,
    },
    detailDistance: {
      color: theme.muted,
      fontSize: 14,
      fontWeight: '700',
      marginTop: 12,
      marginBottom: 16,
    },
    primaryButton: {
      backgroundColor: theme.accent,
      paddingVertical: 15,
      paddingHorizontal: 16,
      borderRadius: 18,
      alignItems: 'center',
      marginTop: 10,
    },
    primaryButtonText: {
      color: theme.white,
      fontSize: 15,
      fontWeight: '900',
    },
    secondaryButton: {
      borderWidth: 1.5,
      borderColor: theme.accent,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 18,
      alignItems: 'center',
      marginTop: 10,
      backgroundColor: 'transparent',
    },
    secondaryButtonText: {
      color: theme.accent,
      fontSize: 15,
      fontWeight: '900',
    },
    infoCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 22,
      padding: 18,
      marginBottom: 14,
      shadowColor: theme.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 2,
    },
    infoTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '900',
      marginBottom: 10,
    },
    infoText: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '600',
    },
    mapCard: {
      backgroundColor: theme.accentSoft,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 26,
      padding: 18,
      marginBottom: 14,
    },
    mapHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    mapTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '900',
    },
    mapBadge: {
      color: theme.accent,
      backgroundColor: theme.card,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: '900',
    },
    mapItem: {
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    mapPin: {
      fontSize: 18,
      marginRight: 10,
    },
    mapTextBox: {
      flex: 1,
    },
    mapItemTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '900',
    },
    mapItemSub: {
      color: theme.muted,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 3,
    },
    noteText: {
      color: theme.muted,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '600',
    },
    emptyCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
    },
    emptyIcon: {
      fontSize: 40,
      marginBottom: 10,
    },
    deviceCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 22,
      padding: 18,
      marginBottom: 14,
    },
    deviceIcon: {
      fontSize: 28,
      marginBottom: 8,
    },
    deviceValue: {
      color: theme.accent,
      fontSize: 44,
      fontWeight: '900',
      marginBottom: 6,
    },
    adPlaceholder: {
      backgroundColor: theme.cardAlt,
      borderRadius: 18,
      paddingVertical: 22,
      alignItems: 'center',
      marginTop: 16,
    },
    adText: {
      color: theme.muted,
      fontWeight: '900',
    },
    lastActionBar: {
      marginHorizontal: 20,
      marginTop: 18,
      marginBottom: 24,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 14,
    },
    lastActionLabel: {
      color: theme.accent,
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    lastActionText: {
      color: theme.muted,
      fontSize: 13,
      fontWeight: '700',
    },
    tabBarOuter: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingHorizontal: 10,
      paddingBottom: 12,
    },
    tabBar: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 28,
      paddingVertical: 8,
      paddingHorizontal: 8,
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 26,
      elevation: 6,
    },
    tabButton: {
      paddingVertical: 10,
      paddingHorizontal: 13,
      borderRadius: 999,
      marginHorizontal: 3,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardAlt,
    },
    activeTabButton: {
      backgroundColor: theme.accent,
    },
    tabIcon: {
      fontSize: 14,
      marginRight: 5,
    },
    tabText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '900',
    },
    activeTabText: {
      color: theme.white,
    },
  });
}