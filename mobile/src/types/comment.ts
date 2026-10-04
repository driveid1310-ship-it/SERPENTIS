export interface Comment {
  _id: string;
  content: string;
  report: string;
  user: {
    _id: string;
    email: string;
    fullName?: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}
