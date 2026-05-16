/*
  ParkMate Parking Data

  This file stores the parking area data used by the app.

  Why this file exists:
  - Keeps parking data separate from the main screen code
  - Makes it easier to add, edit, or remove car parks
  - Makes the project structure cleaner and more professional

  In a production version, this data would normally be loaded from Firebase Firestore.
*/

export type ParkingArea = {
  id: string;
  name: string;
  zone: string;
  distance: string;
  available: number;
  total: number;
  note: string;
  latitude: number;
  longitude: number;
};

export const parkingAreas: ParkingArea[] = [
  {
    id: 'p1',
    name: 'Car Park 3',
    zone: 'Library Zone',
    distance: '2 min walk',
    available: 28,
    total: 80,
    note: 'Closest to the Library, Agora and main study spaces.',
    latitude: -37.7215,
    longitude: 145.0477,
  },
  {
    id: 'p2',
    name: 'Car Park 7',
    zone: 'Sports Centre',
    distance: '5 min walk',
    available: 9,
    total: 65,
    note: 'Useful for the gym, sports centre and nearby tutorial rooms.',
    latitude: -37.7202,
    longitude: 145.0502,
  },
  {
    id: 'p3',
    name: 'Car Park 1',
    zone: 'Main Entrance',
    distance: '7 min walk',
    available: 0,
    total: 120,
    note: 'Often busy during morning classes and peak arrival times.',
    latitude: -37.7229,
    longitude: 145.0453,
  },
  {
    id: 'p4',
    name: 'Car Park 6',
    zone: 'Science Drive',
    distance: '4 min walk',
    available: 16,
    total: 70,
    note: 'Good backup option for students attending labs and lectures.',
    latitude: -37.7191,
    longitude: 145.0489,
  },
];
