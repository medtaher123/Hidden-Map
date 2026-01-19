export interface Notification {
  id: number;
  userId: number;
  type: 'location_approved' | 'location_rejected' | 'comment' | 'rating' | 'points_awarded';
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: {
    locationId?: number;
    locationName?: string;
    points?: number;
  };
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}