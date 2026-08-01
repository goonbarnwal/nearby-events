import { EventItem, UserLocation, AIRecommendationResponse, User } from '../types';

/**
 * Fetch events from server API with search/filters/location parameters.
 */
export async function fetchEvents(params: {
  lat?: number;
  lon?: number;
  city?: string;
  category?: string;
  search?: string;
  radiusKm?: number;
  dateFilter?: string;
}): Promise<EventItem[]> {
  try {
    const query = new URLSearchParams();
    if (params.lat !== undefined) query.set('lat', params.lat.toString());
    if (params.lon !== undefined) query.set('lon', params.lon.toString());
    if (params.city) query.set('city', params.city);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.radiusKm) query.set('radius', params.radiusKm.toString());
    if (params.dateFilter && params.dateFilter !== 'all') query.set('date', params.dateFilter);

    const res = await fetch(`/api/events?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    const data = await res.json();
    return data.events || [];
  } catch (err) {
    console.warn('API fetch failed, falling back to local processing', err);
    return [];
  }
}

/**
 * Reverse geocode latitude and longitude to get City, State, Country.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<UserLocation> {
  try {
    const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json();
      return {
        latitude: lat,
        longitude: lon,
        city: data.city || 'Pune',
        state: data.state || 'Maharashtra',
        country: data.country || 'India',
        isDetected: true,
      };
    }
  } catch (err) {
    console.warn('Geocoding error:', err);
  }

  return {
    latitude: lat,
    longitude: lon,
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    isDetected: true,
  };
}

/**
 * Forward geocode a city/place string to get coordinates.
 */
export async function searchLocation(query: string): Promise<{
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
} | null> {
  try {
    const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Location search error:', err);
  }
  return null;
}

/**
 * Request AI Event Summary using Gemini API.
 */
export async function generateAiSummary(eventId: string, description: string): Promise<string> {
  try {
    const token = localStorage.getItem('nearevent_jwt');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/gemini/summarize', {
      method: 'POST',
      headers,
      body: JSON.stringify({ eventId, description }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.summary || description.slice(0, 150) + '...';
    }
  } catch (err) {
    console.warn('AI summary error:', err);
  }
  return description.slice(0, 150) + '...';
}

/**
 * Request AI Personalized Recommendations from Gemini API.
 */
export async function getAiRecommendations(userInterests: string[], city: string): Promise<AIRecommendationResponse> {
  try {
    const token = localStorage.getItem('nearevent_jwt');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/gemini/recommend', {
      method: 'POST',
      headers,
      body: JSON.stringify({ userInterests, city }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('AI recommendation error:', err);
  }
  return {
    recommendations: [],
    overviewText: `Found curated event picks in ${city} based on top trending activities.`,
  };
}

/**
 * Submit user-created event to backend.
 */
export async function createEvent(eventData: Partial<EventItem>): Promise<EventItem | null> {
  try {
    const token = localStorage.getItem('nearevent_jwt');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/events', {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData),
    });
    if (res.ok) {
      const data = await res.json();
      return data.event;
    }
  } catch (err) {
    console.warn('Create event error:', err);
  }
  return null;
}

/**
 * JWT Auth: Register User
 */
export async function registerUser(data: { name: string; email: string; password: string }): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
  }
  return await res.json();
}

/**
 * JWT Auth: Login User
 */
export async function loginUser(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  return await res.json();
}

/**
 * Google OAuth Authentication
 */
export async function googleAuthUser(data: { credential?: string; name?: string; email?: string }): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Google auth failed');
  }
  return await res.json();
}

/**
 * JWT Auth: Verify Token and fetch current user
 */
export async function getCurrentUser(token: string): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.warn('Get current user error:', err);
  }
  return null;
}

/**
 * Request Password Reset OTP
 */
export async function requestPasswordReset(email: string): Promise<{ message: string; simulatedOtp?: string }> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to request password reset');
  }
  return await res.json();
}

/**
 * Reset Password with OTP
 */
export async function resetPassword(data: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to reset password');
  }
  return await res.json();
}

/**
 * Fetch events created by the logged in user.
 */
export async function fetchMyCreatedEvents(): Promise<EventItem[]> {
  try {
    const token = localStorage.getItem('nearevent_jwt');
    if (!token) return [];
    const res = await fetch('/api/events/my-created', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.events || [];
    }
  } catch (err) {
    console.warn('Fetch my created events error:', err);
  }
  return [];
}

/**
 * Update existing event
 */
export async function updateEvent(eventId: string, eventData: Partial<EventItem>): Promise<EventItem | null> {
  try {
    const token = localStorage.getItem('nearevent_jwt');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(eventData),
    });
    if (res.ok) {
      const data = await res.json();
      return data.event;
    }
  } catch (err) {
    console.warn('Update event error:', err);
  }
  return null;
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('nearevent_jwt');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch (err) {
    console.warn('Delete event error:', err);
    return false;
  }
}

/**
 * Fetch pending events for Admin moderation
 */
export async function fetchPendingEvents(): Promise<EventItem[]> {
  try {
    const token = localStorage.getItem('nearevent_jwt');
    if (!token) return [];
    const res = await fetch('/api/admin/pending-events', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.events || [];
    }
  } catch (err) {
    console.warn('Fetch pending events error:', err);
  }
  return [];
}

/**
 * Admin: Approve Event
 */
export async function approveEvent(eventId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('nearevent_jwt');
    if (!token) return false;
    const res = await fetch(`/api/admin/events/${eventId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch (err) {
    console.warn('Approve event error:', err);
    return false;
  }
}

/**
 * Admin: Reject Event
 */
export async function rejectEvent(eventId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('nearevent_jwt');
    if (!token) return false;
    const res = await fetch(`/api/admin/events/${eventId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch (err) {
    console.warn('Reject event error:', err);
    return false;
  }
}

