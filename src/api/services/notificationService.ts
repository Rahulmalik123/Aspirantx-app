import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'tournament' | 'battle' | 'reward';
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

class NotificationService {
  async getNotifications(page = 1, limit = 20): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    return apiClient.get(ENDPOINTS.NOTIFICATIONS, { params: { page, limit } });
  }

  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    return apiClient.put(ENDPOINTS.MARK_READ(notificationId));
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    return apiClient.put(ENDPOINTS.MARK_ALL_READ);
  }

  async getNotificationSettings(): Promise<any> {
    return apiClient.get(ENDPOINTS.NOTIFICATION_SETTINGS);
  }

  async updateNotificationSettings(settings: any): Promise<{ success: boolean }> {
    return apiClient.put(ENDPOINTS.NOTIFICATION_SETTINGS, settings);
  }
}

export default new NotificationService();
