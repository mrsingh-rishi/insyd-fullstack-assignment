'use client';

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { apiClient } from '@/utils/api';
import { Notification, NotificationCounts } from '@/types';

interface NotificationPanelProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId, isOpen, onClose }) => {
  const { notifications: realtimeNotifications, clearNotifications } = useSocket();
  const [storedNotifications, setStoredNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchCounts();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const notifications = await apiClient.getNotifications(userId, 20, false);
      setStoredNotifications(notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const counts = await apiClient.getNotificationCounts(userId);
      setCounts(counts);
    } catch (error) {
      console.error('Failed to fetch notification counts:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead(userId);
      await fetchNotifications();
      await fetchCounts();
      clearNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const allNotifications = [
    ...realtimeNotifications.filter(n => n.userId === userId),
    ...storedNotifications
  ];

  // Remove duplicates based on message and timestamp
  const uniqueNotifications = allNotifications.filter((notification, index, self) =>
    index === self.findIndex((n) => 
      n.message === notification.message && 
      n.contentId === notification.contentId
    )
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white h-full w-96 shadow-lg overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Notifications</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">
              {counts.unread} unread of {counts.total} total
            </span>
            {counts.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          ) : uniqueNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uniqueNotifications.map((notification, index) => (
                <NotificationItem key={index} notification={notification} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BLOG': return '📝';
      case 'JOB': return '💼';
      case 'MESSAGE': return '💬';
      default: return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Now';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getTypeIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {notification.createdAt ? formatTime(notification.createdAt) : 'Now'}
          </p>
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
