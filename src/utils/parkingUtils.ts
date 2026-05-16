/*
  ParkMate Parking Utility Functions

  This file stores reusable parking logic that is separate from the UI.

  Why this file exists:
  - Keeps calculations out of the main screen file
  - Makes the code easier to test with Jest
  - Makes the app easier to maintain and explain during Q&A
*/

export function getAvailabilityStatus(available: number, total: number): string {
  if (available === 0) return 'Full';

  const ratio = available / total;

  if (ratio >= 0.3) return 'High availability';
  if (ratio >= 0.1) return 'Limited availability';

  return 'Low availability';
}

export function getAvailabilityColour(status: string): string {
  if (status === 'High availability') return '#16a34a';
  if (status === 'Limited availability') return '#ca8a04';
  if (status === 'Low availability') return '#ea580c';

  return '#dc2626';
}

export function calculateAvailabilityPercentage(available: number, total: number): number {
  if (total <= 0) return 0;

  return Math.round((available / total) * 100);
}

export function canSaveFavourite(existingIds: string[], parkingId: string): boolean {
  return !existingIds.includes(parkingId);
}
