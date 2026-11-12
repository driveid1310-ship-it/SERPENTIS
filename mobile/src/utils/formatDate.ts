const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Format an ISO date string or Date object into human-readable relative time (e.g. 'Just now', '5m ago', '2h ago', '3d ago').
 */
export function formatRelativeTime(dateInput?: string | Date | null): string {
  if (!dateInput) {
    return 'Recently';
  }

  const timestamp = typeof dateInput === 'string' ? new Date(dateInput).getTime() : dateInput.getTime();

  if (Number.isNaN(timestamp) || timestamp <= 0) {
    return 'Recently';
  }

  const elapsedMs = Math.max(0, Date.now() - timestamp);

  if (elapsedMs < MINUTE_MS) {
    return 'Just now';
  }
  if (elapsedMs < HOUR_MS) {
    return `${Math.floor(elapsedMs / MINUTE_MS)}m ago`;
  }
  if (elapsedMs < DAY_MS) {
    return `${Math.floor(elapsedMs / HOUR_MS)}h ago`;
  }
  return `${Math.floor(elapsedMs / DAY_MS)}d ago`;
}

/**
 * Format an ISO date string into standard localized date format.
 */
export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) {
    return 'Date unavailable';
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
