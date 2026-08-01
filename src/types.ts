export interface EventItem {
  id: string;
  eventId?: string;
  title: string;
  description: string;
  summary?: string;
  category: string; // e.g. 'Tech', 'Hackathon', 'Workshop', 'Music', 'Sports', 'Business', 'Food'
  subtype?: string; // e.g. 'Conference', 'Meetup', 'Concert', 'Festival', 'Webinar'
  venue: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  timeString: string; // e.g. "9:00 AM - 5:00 PM"
  organizer: string;
  createdByEmail?: string;
  price: number; // 0 for Free
  currency: string;
  seatsLeft?: number;
  totalCapacity?: number;
  registrationUrl: string;
  imageUrl?: string;
  status: 'approved' | 'pending' | 'rejected';
  source?: 'ticketmaster' | 'predicthq' | 'eventbrite' | 'user' | 'database' | 'Official' | 'official';
  tags?: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  isUpcoming?: boolean;
  contactEmail?: string;
  website?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  isDetected: boolean;
}

export interface FilterState {
  searchQuery: string;
  locationQuery: string;
  category: string;
  dateFilter: string; // 'all' | 'today' | 'tomorrow' | 'this_week' | 'this_month' | YYYY-MM-DD
  radiusKm: number; // 5, 10, 20, 50, 100
  priceType: 'all' | 'free' | 'paid';
  sortBy: 'distance' | 'date' | 'popular';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  bookmarkedEventIds: string[];
  registeredEventIds: string[];
}

export interface AIRecommendationResponse {
  recommendations: {
    eventId: string;
    reason: string;
    matchScore: number;
  }[];
  overviewText: string;
}
