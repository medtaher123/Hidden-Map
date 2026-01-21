export interface Profile {
  id: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  isFollowed?: boolean; 
}
