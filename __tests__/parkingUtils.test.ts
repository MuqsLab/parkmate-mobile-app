import {
  getAvailabilityStatus,
  calculateAvailabilityPercentage,
  canSaveFavourite,
} from '../src/utils/parkingUtils';

describe('ParkMate parking utility tests', () => {
  test('returns Full when no parking spaces are available', () => {
    expect(getAvailabilityStatus(0, 100)).toBe('Full');
  });

  test('returns High availability when 30% or more spaces are available', () => {
    expect(getAvailabilityStatus(40, 100)).toBe('High availability');
  });

  test('calculates availability percentage correctly', () => {
    expect(calculateAvailabilityPercentage(25, 100)).toBe(25);
  });

  test('prevents saving duplicate favourites', () => {
    expect(canSaveFavourite(['p1', 'p2'], 'p1')).toBe(false);
  });

  test('allows saving a new favourite', () => {
    expect(canSaveFavourite(['p1', 'p2'], 'p3')).toBe(true);
  });
});
