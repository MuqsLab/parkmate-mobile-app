import { weeklyParkingData } from '../src/data/parkingAnalyticsData';
import {
  createParkingRecommendation,
  createSmartParkingPlan,
  findBestParkingDay,
  findBusiestParkingDay,
} from '../src/utils/analyticsUtils';

describe('ParkMate analytics utility tests', () => {
  test('finds Friday as the best parking day', () => {
    expect(findBestParkingDay(weeklyParkingData)).toBe('Fri');
  });

  test('finds Wednesday as the busiest parking day', () => {
    expect(findBusiestParkingDay(weeklyParkingData)).toBe('Wed');
  });

  test('creates a weekly graph recommendation summary', () => {
    const recommendation = createParkingRecommendation('Fri', 'Wed');

    expect(recommendation).toContain('Fri');
    expect(recommendation).toContain('Wed');
  });

  test('creates a smart plan for most available parking', () => {
    const plan = createSmartParkingPlan(
      'Mon',
      'Morning',
      'Most available',
      weeklyParkingData
    );

    expect(plan.recommendedCarPark).toBe('Car Park 1');
    expect(plan.riskLevel).toBe('Medium');
    expect(plan.reason).toContain('72%');
  });

  test('returns high risk for a busy morning parking plan', () => {
    const plan = createSmartParkingPlan(
      'Wed',
      'Morning',
      'Balanced',
      weeklyParkingData
    );

    expect(plan.riskLevel).toBe('High');
  });
});
