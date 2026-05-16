/*
  Firebase Service for ParkMate

  This file is prepared for Firebase Authentication and Firestore integration.
  In the final production version, Firebase Authentication will manage user login
  and Firestore will store parking areas, favourites, and user data.

  API keys and secrets should not be hard-coded in public repositories.
  They should be stored in environment variables or secure configuration files.
*/

export type FirebaseParkingArea = {
  id: string;
  name: string;
  zone: string;
  available: number;
  total: number;
  distance: string;
};

export const firebaseIntegrationSummary = {
  authentication:
    'Firebase Authentication is selected to support secure student login and account management.',
  firestore:
    'Cloud Firestore is selected to store parking areas, availability data, and user favourites.',
  testLab:
    'Firebase Test Lab is selected to provide automated testing evidence across Android devices.',
};

export function getMockFirestoreParkingData(): FirebaseParkingArea[] {
  return [
    {
      id: 'fs1',
      name: 'Firestore Car Park 3',
      zone: 'Library Zone',
      available: 28,
      total: 80,
      distance: '2 min walk',
    },
    {
      id: 'fs2',
      name: 'Firestore Car Park 7',
      zone: 'Sports Centre',
      available: 9,
      total: 65,
      distance: '5 min walk',
    },
  ];
}
