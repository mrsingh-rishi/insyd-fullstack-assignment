'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  connectUser: (userId: number) => void;
  clearNotifications: () => void;
}

interface Notification {
  id?: number;
  userId: number;
  contentId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Notification', {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    setSocket(newSocket);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, []);

  const connectUser = (userId: number) => {
    if (socket) {
      socket.emit('authenticate', userId);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      notifications,
      connectUser,
      clearNotifications
    }}>
      {children}
    </SocketContext.Provider>
  );
};
