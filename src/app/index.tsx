import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type TabName = 'Home' | 'Parking' | 'Map' | 'Favourites' | 'Safety' | 'Settings';

type ParkingArea = {
  id: string;
  name: string;
  zone: string;
  distance: string;
  available: number;
  total: number;
  note: string;
};

const parkingAreas: ParkingArea[] = [
  {
    id: 'p1',
    name: 'Car Park 3',
    zone: 'Library Zone',
    distance: '2 min walk',
    available: 28,
    total: 80,
    note: 'Closest to the Library, Agora and main study spaces.',
  },
  {
    id: 'p2',
    name: 'Car Park 7',
    zone: 'Sports Centre',
    distance: '5 min walk',
    available: 9,
    total: 65,
    note: 'Useful for the gym, sports centre and nearby tutorial rooms.',
  },
  {
    id: 'p3',
    name: 'Car Park 1',
    zone: 'Main Entrance',
    distance: '7 min walk',
    available: 0,
    total: 120,
    note: 'Often busy during morning classes and peak arrival times.',
  },
  {
    id: 'p4',
    name: 'Car Park 6',
    zone: 'Science Drive',
    distance: '4 min walk',
    available: 16,
    total: 70,
    note: 'Good backup option for students attending labs and lectures.',
  },
];

function getAvailabilityStatus(available: number, total: number) {
  if (available === 0) return 'Full';

  const ratio = available / total;

  if (ratio >= 0.3) return 'High availability';
  if (ratio >= 0.1) return 'Limited availability';
  return 'Low availability';
}

function getAvailabilityColour(status: string) {
  if (status === 'High availability') return '#16a34a';
  if (status === 'Limited availability') return '#ca8a04';
  if (status === 'Low availability') return '#ea580c';
  return '#dc2626';
}

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function ParkMateApp() {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [selectedParking, setSelectedParking] = useState<ParkingArea>(parkingAreas[0]);
  const [favourites, setFavourites] = useState<ParkingArea[]>([parkingAreas[0]]);
  const [darkMode, setDarkMode] = useState(false);
  const [locationText, setLocationText] = useState('Location not requested yet');
  const [batteryLevel, setBatteryLevel] = useState('Checking...');
  const [movement, setMovement] = useState('Waiting for movement data...');
  const [lastAction, setLastAction] = useState('No action yet.');

  const theme = useMemo(
    () => ({
      bg: darkMode ? '#0f172a' : '#eef6ff',
      card: darkMode ? '#1e293b' : '#ffffff',
      text: darkMode ? '#f8fafc' : '#0f172a',
      muted: darkMode ? '#cbd5e1' : '#475569',
      border: darkMode ? '#334155' : '#cbd5e1',
      accent: '#2563eb',
      softAccent: darkMode ? '#1e3a8a' : '#dbeafe',
    }),
    [darkMode]
  );

  useEffect(() => {
    async function loadBattery() {
      try {
        const level = await Battery.getBatteryLevelAsync();

        if (level === -1 || Number.isNaN(level)) {
          setBatteryLevel('Unavailable');
        } else {
          setBatteryLevel(`${Math.round(level * 100)}%`);
        }
      } catch {
        setBatteryLevel('Battery unavailable on this device');
      }
    }

    loadBattery();

    if (Platform.OS === 'web') {
      setMovement('Accelerometer is available when running on a mobile device.');
      return;
    }

    const subscription = Accelerometer.addListener((data) => {
      const totalMovement = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);

      if (totalMovement > 1.8) {
        setMovement('Movement detected. Phone may be in motion.');
      } else {
        setMovement('Phone movement is stable.');
      }
    });

    Accelerometer.setUpdateInterval(1000);

    return () => {
      subscription.remove();
    };
  }, []);

  async function requestLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationText('Location permission denied.');
        setLastAction('GPS permission was denied.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const text = `Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}`;

      setLocationText(text);
      setLastAction('GPS location loaded successfully.');
    } catch {
      setLocationText('Location unavailable on this device/browser.');
      setLastAction('GPS request failed or is unsupported.');
    }
  }

  async function sendParkingNotification() {
    try {
      if (Platform.OS === 'web') {
        showMessage(
          'Notification Demo',
          `ParkMate reminder: Remember to check ${selectedParking.name} before leaving for campus.`
        );
        setLastAction('Web notification simulated with an alert.');
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== 'granted') {
        showMessage('Notifications', 'Notification permission was not granted.');
        setLastAction('Notification permission denied.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'ParkMate Reminder',
          body: `Remember to check ${selectedParking.name} before leaving for campus.`,
        },
        trigger: null,
      });

      setLastAction('Parking reminder notification was sent.');
      showMessage('Notification Sent', 'A ParkMate parking reminder was triggered.');
    } catch {
      showMessage('Notification Error', 'Notifications are unavailable on this device.');
      setLastAction('Notification failed or is unsupported.');
    }
  }

  function speakInfo() {
    const status = getAvailabilityStatus(selectedParking.available, selectedParking.total);
    const message = `${selectedParking.name}, ${selectedParking.zone}. ${status}. ${selectedParking.available} out of ${selectedParking.total} spaces available. Distance is ${selectedParking.distance}. ${selectedParking.note}`;

    setLastAction('Voice parking assistant used.');

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      showMessage('Voice Parking Assistant', message);
    }
  }

  function speakSafetyReminder() {
    const message =
      'ParkMate safety reminder. Only use the app when parked or when it is safe. Do not interact with the app while actively driving.';

    setLastAction('Safety voice reminder used.');

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      showMessage('Safety Reminder', message);
    }
  }

  function addFavourite(parking: ParkingArea) {
    const exists = favourites.some((item) => item.id === parking.id);

    if (!exists) {
      setFavourites([...favourites, parking]);
      setLastAction(`${parking.name} saved as a favourite.`);
      showMessage('Favourite Saved', `${parking.name} was added to favourites.`);
    } else {
      setLastAction(`${parking.name} is already saved.`);
      showMessage('Already Saved', `${parking.name} is already in favourites.`);
    }
  }

  function renderParkingCard(parking: ParkingArea) {
    const status = getAvailabilityStatus(parking.available, parking.total);
    const statusColour = getAvailabilityColour(status);

    return (
      <Pressable
        key={parking.id}
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => {
          setSelectedParking(parking);
          setActiveTab('Parking');
          setLastAction(`${parking.name} selected and passed to Parking Details screen.`);
        }}
      >
        <View style={styles.rowBetween}>
          <View style={styles.flexOne}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{parking.name}</Text>
            <Text style={[styles.muted, { color: theme.muted }]}>{parking.zone}</Text>
          </View>

          <Text style={[styles.badge, { backgroundColor: statusColour }]}>{status}</Text>
        </View>

        <Text style={[styles.muted, { color: theme.muted }]}>
          {parking.available}/{parking.total} spaces • {parking.distance}
        </Text>
      </Pressable>
    );
  }

  function HomeScreen() {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: theme.text }]}>ParkMate</Text>

        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Smart campus parking assistant for La Trobe students.
        </Text>

        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Assessment 4 Feature Coverage</Text>

          <Text style={[styles.muted, { color: theme.muted }]}>
            This mobile app demonstrates screens, data passing, GPS, battery, accelerometer, notifications,
            favourites, dark mode, AdMob placeholder, and voice guidance.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Parking</Text>

        {parkingAreas.map(renderParkingCard)}
      </ScrollView>
    );
  }

  function ParkingScreen() {
    const status = getAvailabilityStatus(selectedParking.available, selectedParking.total);
    const statusColour = getAvailabilityColour(status);

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: theme.text }]}>Parking Details</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{selectedParking.name}</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{selectedParking.zone}</Text>

          <Text style={[styles.bigNumber, { color: statusColour }]}>
            {selectedParking.available}/{selectedParking.total}
          </Text>

          <Text style={[styles.muted, { color: theme.muted }]}>Available spaces</Text>

          <Text style={[styles.badgeLarge, { backgroundColor: statusColour }]}>{status}</Text>

          <Text style={[styles.bodyText, { color: theme.text }]}>{selectedParking.note}</Text>

          <Text style={[styles.muted, { color: theme.muted }]}>Distance: {selectedParking.distance}</Text>

          <Pressable style={[styles.button, { backgroundColor: theme.accent }]} onPress={speakInfo}>
            <Text style={styles.buttonText}>Speak Info</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, { borderColor: theme.accent }]}
            onPress={() => addFavourite(selectedParking)}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Save Favourite</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, { borderColor: theme.accent }]}
            onPress={sendParkingNotification}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Send Reminder Notification</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Between Screens</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>
            The selected parking area is stored in state and displayed on this details screen. This demonstrates
            data being passed from the list/map selection into the detail view.
          </Text>
        </View>
      </ScrollView>
    );
  }

  function MapScreen() {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: theme.text }]}>Map and GPS</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Location</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>{locationText}</Text>

          <Pressable style={[styles.button, { backgroundColor: theme.accent }]} onPress={requestLocation}>
            <Text style={styles.buttonText}>Get GPS Location</Text>
          </Pressable>
        </View>

        <View style={[styles.mapMock, { borderColor: theme.border }]}>
          <Text style={styles.mapText}>La Trobe Campus Map Preview</Text>

          {parkingAreas.map((parking) => (
            <Pressable
              key={parking.id}
              style={styles.mapPinBox}
              onPress={() => {
                setSelectedParking(parking);
                setActiveTab('Parking');
                setLastAction(`${parking.name} selected from the map screen.`);
              }}
            >
              <Text style={styles.mapPin}>📍 {parking.name} - {parking.zone}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.muted, { color: theme.muted }]}>
          Note: This prototype uses a map-style preview. A production app would connect to Google Maps or Apple Maps.
        </Text>
      </ScrollView>
    );
  }

  function FavouritesScreen() {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: theme.text }]}>Favourites</Text>

        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Saved parking areas are available for quick access.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>SQLite / Local Storage Plan</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>
            This prototype uses app state for fast demonstration. The installed SQLite package is intended for
            persistent favourites in the final mobile build.
          </Text>
        </View>

        {favourites.length === 0 ? (
          <Text style={[styles.muted, { color: theme.muted }]}>No favourites saved yet.</Text>
        ) : (
          favourites.map(renderParkingCard)
        )}
      </ScrollView>
    );
  }

  function SafetyScreen() {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: theme.text }]}>Safety and Device Features</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Battery</Text>
          <Text style={[styles.bigNumber, { color: theme.accent }]}>{batteryLevel}</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>Current device battery level.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Accelerometer Sensor</Text>
          <Text style={[styles.bodyText, { color: theme.text }]}>{movement}</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>
            On web, a fallback message is shown. On mobile through Expo Go, the phone sensor can detect movement.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Safety Reminder</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>
            ParkMate should only be used when safe and not while actively driving.
          </Text>

          <Pressable style={[styles.button, { backgroundColor: theme.accent }]} onPress={speakSafetyReminder}>
            <Text style={styles.buttonText}>Speak Safety Reminder</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  function SettingsScreen() {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: theme.text }]}>Settings</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Theme</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>
            Dark mode supports usability in low-light environments and improves comfort.
          </Text>

          <Pressable
            style={[styles.button, { backgroundColor: darkMode ? '#f97316' : theme.accent }]}
            onPress={() => {
              setDarkMode(!darkMode);
              setLastAction('Theme changed.');
            }}
          >
            <Text style={styles.buttonText}>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Firebase Integration Plan</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>
            Firebase Authentication will support login, Firestore will store parking and user data, and Firebase
            Test Lab will be used for automated device testing evidence.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>AdMob Placeholder</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>
            This area represents where a Google AdMob test banner could be placed in the production version.
          </Text>

          <View style={styles.adBox}>
            <Text style={styles.adText}>Test Ad Banner Placeholder</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Last App Action</Text>
          <Text style={[styles.muted, { color: theme.muted }]}>{lastAction}</Text>
        </View>
      </ScrollView>
    );
  }

  function renderActiveScreen() {
    if (activeTab === 'Home') return <HomeScreen />;
    if (activeTab === 'Parking') return <ParkingScreen />;
    if (activeTab === 'Map') return <MapScreen />;
    if (activeTab === 'Favourites') return <FavouritesScreen />;
    if (activeTab === 'Safety') return <SafetyScreen />;
    return <SettingsScreen />;
  }

  const tabs: TabName[] = ['Home', 'Parking', 'Map', 'Favourites', 'Safety', 'Settings'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.appFrame, { backgroundColor: theme.bg }]}>
        <View style={[styles.topBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.logo, { color: theme.accent }]}>PARKMATE</Text>
          <Text style={[styles.topBarText, { color: theme.muted }]}>Assessment 4 Mobile App</Text>
        </View>

        <View style={styles.content}>{renderActiveScreen()}</View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.tabBar, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: theme.accent },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && { color: '#ffffff' }]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appFrame: {
    flex: 1,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  logo: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  topBarText: {
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  flexOne: {
    flex: 1,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginVertical: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
  },
  badge: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  badgeLarge: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginVertical: 12,
    overflow: 'hidden',
  },
  bigNumber: {
    fontSize: 42,
    fontWeight: '900',
    marginTop: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: '800',
    fontSize: 15,
  },
  mapMock: {
    minHeight: 280,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#bfdbfe',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mapText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  mapPinBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  mapPin: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '700',
  },
  adBox: {
    marginTop: 12,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adText: {
    color: '#334155',
    fontWeight: '800',
  },
  tabBar: {
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    maxHeight: 66,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: '#e2e8f0',
  },
  tabText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 13,
  },
});