/**
 * Community Groups & Real-Time Chat Types
 */

export interface GroupSummary {
  id: string;
  name: string;
  description?: string;
  category: string;
  creatorId: string;
  memberCount: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessagePayload {
  groupId: string;
  senderId: string;
  content: string;
  createdAt?: string;
}

