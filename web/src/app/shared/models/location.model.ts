export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  photos: Photo[];
}

export interface LocationsResponse {
  data: Location[];
  total: number;
  page: number;
  limit: number;
}

export const LOCATION_CATEGORIES = {
  cafe: { label: 'Cafe', color: '#8B4513', icon: '☕' },
  art: { label: 'Art', color: '#FF6B6B', icon: '🎨' },
  park: { label: 'Park', color: '#51CF66', icon: '🌳' },
  shop: { label: 'Shop', color: '#FFD93D', icon: '🛍️' },
  restaurant: { label: 'Restaurant', color: '#FF8C42', icon: '🍽️' },
  museum: { label: 'Museum', color: '#6C5CE7', icon: '🏛️' },
  viewpoint: { label: 'Viewpoint', color: '#A29BFE', icon: '🏞️' },
  nightlife: { label: 'Nightlife', color: '#FF7675', icon: '🌙' },
  other: { label: 'Other', color: '#95A5A6', icon: '📍' },
};
