export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Rating {
  id: string;
  rating: number;
  user: User;
  createdAt: Date;
}

export interface Comment {
  id: string;
  commentText: string;
  user: User;
  createdAt: Date;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  photos: Photo[];
  ratings?: Rating[];
  comments?: Comment[];
  averageRating?: number;
  isFavorite?: boolean;
  submittedById?: string;
}

export interface LocationsResponse {
  data: Location[];
  total: number;
  page: number;
  limit: number;
}

export enum LocationCategory {
  CAFE = 'cafe',
  ART = 'art',
  PARK = 'park',
  SHOP = 'shop',
  RESTAURANT = 'restaurant',
  MUSEUM = 'museum',
  VIEWPOINT = 'viewpoint',
  NIGHTLIFE = 'nightlife',
  OTHER = 'other',
}

export const LOCATION_CATEGORIES: Record<LocationCategory, { label: string; color: string; icon: string }> = {
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
