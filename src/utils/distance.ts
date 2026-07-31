/**
 * Haversine formula to calculate distance between two coordinates in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

/**
 * Format date string (YYYY-MM-DD) into parts for the date badge:
 * month: "MAY", day: "25", dayOfWeek: "Sat"
 */
export function formatDateParts(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) {
      return { month: 'MAY', day: '25', dayOfWeek: 'Sat' };
    }
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate().toString();
    const dayOfWeek = d.toLocaleString('en-US', { weekday: 'short' });
    return { month, day, dayOfWeek };
  } catch {
    return { month: 'MAY', day: '25', dayOfWeek: 'Sat' };
  }
}

/**
 * Check if a given event date falls within date filter ('today', 'tomorrow', 'this_week', 'this_month')
 */
export function isDateInFilter(eventDateStr: string, filter: string): boolean {
  if (!filter || filter === 'all') return true;
  const now = new Date();
  const eventDate = new Date(eventDateStr + 'T00:00:00');

  const todayStr = now.toISOString().split('T')[0];

  if (filter === 'today') {
    return eventDateStr === todayStr;
  }

  if (filter === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return eventDateStr === tomorrow.toISOString().split('T')[0];
  }

  if (filter === 'this_week') {
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    return eventDate >= now && eventDate <= endOfWeek;
  }

  if (filter === 'this_month') {
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  }

  // Exact date match
  return eventDateStr === filter;
}
