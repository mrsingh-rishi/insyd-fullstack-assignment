const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = API_BASE_URL) {
    console.log('API Base URL:', baseUrl);
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Users
  async getUsers() {
    return this.request('/api/users');
  }

  async getUser(id: number) {
    return this.request(`/api/users/${id}`);
  }

  async createUser(data: { username: string; email: string }) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Follows
  async getFollowers(userId: number) {
    return this.request(`/api/follows/user/${userId}/followers`);
  }

  async getFollowing(userId: number) {
    return this.request(`/api/follows/user/${userId}/following`);
  }

  async followUser(followerId: number, followingId: number) {
    return this.request('/api/follows', {
      method: 'POST',
      body: JSON.stringify({ followerId, followingId }),
    });
  }

  async unfollowUser(followerId: number, followingId: number) {
    return this.request('/api/follows', {
      method: 'DELETE',
      body: JSON.stringify({ followerId, followingId }),
    });
  }

  async isFollowing(followerId: number, followingId: number) {
    return this.request(`/api/follows/check?followerId=${followerId}&followingId=${followingId}`);
  }

  // Content
  async getContent(limit = 20) {
    return this.request(`/api/content?limit=${limit}`);
  }

  async getContentById(id: number) {
    return this.request(`/api/content/${id}`);
  }

  async createContent(data: { userId: number; type: string; title: string; body?: string }) {
    return this.request('/api/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserFeed(userId: number, limit = 20) {
    return this.request(`/api/content/user/${userId}/feed?limit=${limit}`);
  }

  // Notifications
  async getNotifications(userId: number, limit = 20, unreadOnly = false) {
    return this.request(`/api/notifications/user/${userId}?limit=${limit}&unreadOnly=${unreadOnly}`);
  }

  async getNotificationCounts(userId: number) {
    return this.request(`/api/notifications/user/${userId}/count`);
  }

  async markNotificationAsRead(notificationId: number) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(userId: number) {
    return this.request(`/api/notifications/user/${userId}/read-all`, {
      method: 'PUT',
    });
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();
