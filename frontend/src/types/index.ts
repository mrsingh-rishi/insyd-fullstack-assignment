export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  _count?: {
    followers: number;
    following: number;
    content: number;
  };
}

export interface Content {
  id: number;
  userId: number;
  type: 'BLOG' | 'JOB' | 'MESSAGE';
  title: string;
  body?: string;
  createdAt: string;
  user: User;
  _count?: {
    notifications: number;
  };
}

export interface Notification {
  id: number;
  userId: number;
  contentId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  content?: Content;
}

export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
  follower?: User;
  following?: User;
}

export interface NotificationCounts {
  total: number;
  unread: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
