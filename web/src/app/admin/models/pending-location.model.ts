export interface PendingLocation {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  submittedBy: {
    id: number;
    username: string;
  };
}
