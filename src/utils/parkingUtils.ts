export function getAvailabilityStatus(available: number, total: number): string {
  if (available === 0) return 'Full';

  const ratio = available / total;

  if (ratio >= 0.3) return 'High availability';
  if (ratio >= 0.1) return 'Limited availability';

  return 'Low availability';
}

export function calculateAvailabilityPercentage(available: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((available / total) * 100);
}

export function canSaveFavourite(existingIds: string[], parkingId: string): boolean {
  return !existingIds.includes(parkingId);
}
