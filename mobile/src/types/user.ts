export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  trustScore: number;
  role: 'citizen' | 'moderator' | 'admin';
  profilePicture?: string;
}

export interface UpdateCurrentUserPayload {
  fullName?: string;
  profilePicture?: string;
}
