/*
  ParkMate analytics utility functions

  These functions support the Context-Aware Parking Analytics with Graphs feature.
  The app does not only show a graph; it also analyses the data and gives a recommendation.
*/

import { WeeklyParkingData } from '../data/parkingAnalyticsData';

export function findBestParkingDay(data: WeeklyParkingData[]): string {
  let bestDay = data[0].day;
  let bestAverage = 0;

  data.forEach((item) => {
    const average = (item.carPark1 + item.carPark2 + item.carPark3) / 3;

    if (average > bestAverage) {
      bestAverage = average;
      bestDay = item.day;
    }
  });

  return bestDay;
}

export function findBusiestParkingDay(data: WeeklyParkingData[]): string {
  let busiestDay = data[0].day;
  let lowestAverage = 100;

  data.forEach((item) => {
    const average = (item.carPark1 + item.carPark2 + item.carPark3) / 3;

    if (average < lowestAverage) {
      lowestAverage = average;
      busiestDay = item.day;
    }
  });

  return busiestDay;
}

export function createParkingRecommendation(bestDay: string, busiestDay: string): string {
  return `Based on the weekly graph, ${bestDay} has the highest parking availability. ${busiestDay} appears to be the busiest day, so students should arrive earlier on that day.`;
}