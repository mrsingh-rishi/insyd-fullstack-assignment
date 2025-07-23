'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const notifications = await apiClient.getNotifications(userId, 20, false);
      setStoredNotifications(notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchCounts = useCallback(async () => {
    try {
      const counts = await apiClient.getNotificationCounts(userId);
      setCounts(counts);
    } catch (error) {
      console.error('Failed to fetch notification counts:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchCounts();
    }
  }, [isOpen, userId, fetchNotifications, fetchCounts]);


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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-white/90 backdrop-blur-lg h-full w-96 shadow-2xl overflow-y-auto border-l border-gray-200/50">
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📬</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">{counts.unread}</span> unread of{' '}
                <span className="font-semibold">{counts.total}</span> total
              </span>
            </div>
            {counts.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all duration-200"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading notifications...</p>
            </div>
          ) : uniqueNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications yet</h3>
              <p className="text-gray-500">You&apos;ll see real-time notifications here when others post content!</p>
            </div>
          ) : (
            <div className="space-y-4">
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

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BLOG': return 'from-blue-500 to-cyan-500';
      case 'JOB': return 'from-green-500 to-emerald-500';
      case 'MESSAGE': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BLOG': return { color: 'bg-blue-100 text-blue-700', text: 'Blog Post' };
      case 'JOB': return { color: 'bg-green-100 text-green-700', text: 'Job Posting' };
      case 'MESSAGE': return { color: 'bg-purple-100 text-purple-700', text: 'Message' };
      default: return { color: 'bg-gray-100 text-gray-700', text: 'Notification' };
    }
  };

  const typeBadge = getTypeBadge(notification.type);

  return (
    <div className={`group relative p-4 rounded-xl transition-all duration-200 border backdrop-blur-sm ${
      !notification.isRead 
        ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/60 shadow-md hover:shadow-lg' 
        : 'bg-white/60 hover:bg-white/80 border-gray-200/50 hover:border-gray-300/50 hover:shadow-md'
    }`}>
      <div className="flex items-start space-x-4">
        {/* Type Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg bg-gradient-to-r ${getTypeColor(notification.type)}`}>
          <span className="text-white">{getTypeIcon(notification.type)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Message */}
          <p className={`text-sm leading-relaxed mb-2 ${
            !notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
          }`}>
            {notification.message}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeBadge.color}`}>
                {typeBadge.text}
              </span>
              <span className="text-xs text-gray-500">
                {notification.createdAt ? formatTime(notification.createdAt) : 'Now'}
              </span>
            </div>
            
            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-blue-600">New</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200/50 transition-colors duration-200 pointer-events-none"></div>
    </div>
  );
};

export default NotificationPanel;
