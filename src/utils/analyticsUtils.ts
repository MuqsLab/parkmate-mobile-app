/*
  ParkMate analytics utility functions

  These functions support the Context-Aware Parking Analytics with Graphs feature.
  They include safe fallbacks so the app does not crash if analytics data is empty.

  Supplementary Assessment 3 upgrade:
  - The feature is not only a static graph.
  - The user can select a day, time period, and preference.
  - The app then returns a context-aware parking recommendation.
*/

import { WeeklyParkingData } from '../data/parkingAnalyticsData';

export type ParkingPreference = 'Most available' | 'Shortest walk' | 'Balanced';

export type ParkingTimePeriod = 'Morning' | 'Midday' | 'Afternoon';

export type SmartParkingPlan = {
  recommendedCarPark: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  reason: string;
};

function getAverageAvailability(item: WeeklyParkingData): number {
  return (item.carPark1 + item.carPark2 + item.carPark3) / 3;
}

export function findBestParkingDay(data: WeeklyParkingData[]): string {
  if (!data || data.length === 0) {
    return 'No data';
  }

  let bestDay = data[0].day;
  let bestAverage = getAverageAvailability(data[0]);

  data.forEach((item) => {
    const average = getAverageAvailability(item);

    if (average > bestAverage) {
      bestAverage = average;
      bestDay = item.day;
    }
  });

  return bestDay;
}

export function findBusiestParkingDay(data: WeeklyParkingData[]): string {
  if (!data || data.length === 0) {
    return 'No data';
  }

  let busiestDay = data[0].day;
  let lowestAverage = getAverageAvailability(data[0]);

  data.forEach((item) => {
    const average = getAverageAvailability(item);

    if (average < lowestAverage) {
      lowestAverage = average;
      busiestDay = item.day;
    }
  });

  return busiestDay;
}

export function createParkingRecommendation(bestDay: string, busiestDay: string): string {
  if (bestDay === 'No data' || busiestDay === 'No data') {
    return 'No analytics data is available yet. In a real app, parking data would come from Firebase, an API, or campus parking sensors.';
  }

  return `Based on the weekly graph, ${bestDay} has the highest parking availability. ${busiestDay} appears to be the busiest day, so students should arrive earlier on that day.`;
}

export function createSmartParkingPlan(
  selectedDay: string,
  selectedTime: ParkingTimePeriod,
  preference: ParkingPreference,
  data: WeeklyParkingData[]
): SmartParkingPlan {
  const fallbackPlan: SmartParkingPlan = {
    recommendedCarPark: 'Car Park 3',
    riskLevel: 'Medium',
    reason:
      'Sample analytics data is being used. In a full version, ParkMate would use live campus parking data.',
  };

  if (!data || data.length === 0) {
    return fallbackPlan;
  }

  const dayData = data.find((item) => item.day === selectedDay) || data[0];

  let riskLevel: SmartParkingPlan['riskLevel'] = 'Low';
  const average = getAverageAvailability(dayData);

  if (average < 40) {
    riskLevel = 'High';
  } else if (average < 60) {
    riskLevel = 'Medium';
  }

  if (selectedTime === 'Morning') {
    riskLevel = riskLevel === 'Low' ? 'Medium' : 'High';
  }

  if (preference === 'Most available') {
    const options = [
      { name: 'Car Park 1', value: dayData.carPark1 },
      { name: 'Car Park 2', value: dayData.carPark2 },
      { name: 'Car Park 3', value: dayData.carPark3 },
    ];

    const bestOption = options.reduce((best, current) =>
      current.value > best.value ? current : best
    );

    return {
      recommendedCarPark: bestOption.name,
      riskLevel,
      reason: `${selectedDay} ${selectedTime.toLowerCase()} was checked using the weekly graph data. Because your preference is most available parking, ${bestOption.name} is recommended with ${bestOption.value}% sample availability.`,
    };
  }

  if (preference === 'Shortest walk') {
    return {
      recommendedCarPark: 'Car Park 3',
      riskLevel,
      reason: `${selectedDay} ${selectedTime.toLowerCase()} was checked. Because your preference is shortest walk, Car Park 3 is recommended as the closer option for the Library Zone in this prototype.`,
    };
  }

  return {
    recommendedCarPark: average >= 60 ? 'Car Park 3' : 'Car Park 1',
    riskLevel,
    reason: `${selectedDay} ${selectedTime.toLowerCase()} was checked using availability and walking convenience. Because your preference is balanced, the app combines graph availability with a practical parking choice.`,
  };
}