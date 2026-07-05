/*
  ParkMate supplementary feature:
  Context-Aware Parking Analytics with Graphs

  This file stores sample weekly parking analytics data for La Trobe Bundoora.
  In a real app, this data could come from Firebase, a parking API, or campus parking sensors.
*/

export type WeeklyParkingData = {
  day: string;
  carPark1: number;
  carPark2: number;
  carPark3: number;
};

export const weeklyParkingData: WeeklyParkingData[] = [
  { day: 'Mon', carPark1: 72, carPark2: 55, carPark3: 68 },
  { day: 'Tue', carPark1: 64, carPark2: 48, carPark3: 61 },
  { day: 'Wed', carPark1: 42, carPark2: 31, carPark3: 39 },
  { day: 'Thu', carPark1: 58, carPark2: 46, carPark3: 52 },
  { day: 'Fri', carPark1: 81, carPark2: 63, carPark3: 77 },
];

export const carParkAverageData = [
  { name: 'Car Park 1', average: 63 },
  { name: 'Car Park 2', average: 49 },
  { name: 'Car Park 3', average: 59 },
];
