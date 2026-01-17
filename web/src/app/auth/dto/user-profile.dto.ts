export interface UserProfileDto {
  id: string;
  name: string;
  email: string;
  role?: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
