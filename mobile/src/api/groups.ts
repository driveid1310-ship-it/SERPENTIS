import axiosInstance from '../config/axios';

export interface Group {
  _id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  creator: any;
  createdAt: string;
}

export interface GroupMessage {
  _id: string;
  group: string;
  sender: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  text: string;
  sharedReport?: string | { _id: string, title: string, category: string, status: string, location: any };
  createdAt: string;
}

export interface GroupMember {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  role: string;
  joinedAt: string;
}

export async function getGroupsRequest(category?: string, search?: string): Promise<Group[]> {
  const params: any = {};
  if (category) params.category = category;
  if (search) params.search = search;
  
  const response = await axiosInstance.get<Group[]>('/groups', { params });
  return response.data;
}

export async function getGroupDetailsRequest(id: string): Promise<{ group: Group; membership: any }> {
  const response = await axiosInstance.get<{ group: Group; membership: any }>(`/groups/${id}`);
  return response.data;
}

export async function createGroupRequest(data: { name: string; description: string; category: string }): Promise<Group> {
  const response = await axiosInstance.post<Group>('/groups', data);
  return response.data;
}

export async function joinGroupRequest(id: string): Promise<{ message: string }> {
  const response = await axiosInstance.post<{ message: string }>(`/groups/${id}/join`);
  return response.data;
}

export async function leaveGroupRequest(id: string): Promise<{ message: string }> {
  const response = await axiosInstance.post<{ message: string }>(`/groups/${id}/leave`);
  return response.data;
}

export async function getGroupMessagesRequest(id: string, page = 1): Promise<GroupMessage[]> {
  const response = await axiosInstance.get<GroupMessage[]>(`/groups/${id}/messages?page=${page}`);
  return response.data;
}

export async function getGroupMembersRequest(id: string): Promise<GroupMember[]> {
  const response = await axiosInstance.get<GroupMember[]>(`/groups/${id}/members`);
  return response.data;
}
export async function getMyGroupsRequest(): Promise<Group[]> {
  const response = await axiosInstance.get<Group[]>('/groups/my');
  return response.data;
}
