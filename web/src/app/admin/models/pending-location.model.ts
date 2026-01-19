export interface PendingLocation {
  id: string;
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  createdAt: string;
  submittedBy: {
    id: string;
    name: string;
  };
  photos?: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    caption?: string;
  }>;
}
