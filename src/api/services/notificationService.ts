import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'general' | 'achievement' | 'reward' | 'reminder' | 'alert' | 'info' | 'success' | 'warning' | 'tournament' | 'battle' | 'system';
  isRead: boolean;
  isBroadcast?: boolean;
  data?: any;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

class NotificationService {
  async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<NotificationsResponse> {
    return apiClient.get(ENDPOINTS.NOTIFICATIONS, { params: { page, limit, unreadOnly } });
  }

  async markAsRead(notificationId: string): Promise<void> {
    return apiClient.put(ENDPOINTS.MARK_READ(notificationId));
  }

  async markBroadcastAsRead(broadcastId: string): Promise<void> {
    return apiClient.put(ENDPOINTS.MARK_BROADCAST_READ(broadcastId));
  }

  async markAllAsRead(): Promise<void> {
    return apiClient.put(ENDPOINTS.MARK_ALL_READ);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete(ENDPOINTS.DELETE_NOTIFICATION(notificationId));
  }

  async getNotificationSettings(): Promise<any> {
    return apiClient.get(ENDPOINTS.NOTIFICATION_SETTINGS);
  }

  async updateNotificationSettings(settings: any): Promise<void> {
    return apiClient.put(ENDPOINTS.NOTIFICATION_SETTINGS, settings);
  }
}

export default new NotificationService();
