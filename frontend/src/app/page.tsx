'use client';

import React, { useEffect, useState } from 'react';
import { SocketProvider, useSocket } from '@/contexts/SocketContext';
import NotificationPanel from '@/components/NotificationPanel';
import { apiClient } from '@/utils/api';
import { User, Content } from '@/types';

const Home: React.FC = () => {
  return (
    <SocketProvider>
      <MainApp />
    </SocketProvider>
  );
};

const MainApp: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [content, setContent] = useState<Content[]>([]);
  const [newContent, setNewContent] = useState({
    type: 'BLOG',
    title: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const { connectUser, isConnected, notifications } = useSocket();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersData, contentData] = await Promise.all([
          apiClient.getUsers(),
          apiClient.getContent(10)
        ]);
        setUsers(usersData);
        setContent(contentData);
        if (usersData.length > 0) {
          setCurrentUser(usersData[0]);
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      connectUser(currentUser.id);
    }
  }, [currentUser, connectUser]);

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newContent.title.trim()) return;

    setLoading(true);
    try {
      const createdContent = await apiClient.createContent({
        userId: currentUser.id,
        type: newContent.type,
        title: newContent.title,
        body: newContent.body || undefined
      });
      
      setContent(prev => [createdContent, ...prev]);
      setNewContent({ type: 'BLOG', title: '', body: '' });
    } catch (error) {
      console.error('Failed to create content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (targetUserId: number) => {
    if (!currentUser || targetUserId === currentUser.id) return;

    try {
      await apiClient.followUser(currentUser.id, targetUserId);
      console.log(`User ${currentUser.id} followed user ${targetUserId}`);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">🔔 Real-time Notifications</h1>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {currentUser && (
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Select User</h2>
              {users.length > 0 ? (
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentUser(user)}
                          className={`px-3 py-1 rounded text-sm ${
                            currentUser?.id === user.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {currentUser?.id === user.id ? 'Current' : 'Select'}
                        </button>
                        {currentUser && currentUser.id !== user.id && (
                          <button
                            onClick={() => handleFollowUser(user.id)}
                            className="px-3 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700"
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Loading users...</p>
              )}
            </div>

            {/* Create Content Form */}
            {currentUser && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">Create Content</h2>
                <form onSubmit={handleCreateContent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content Type
                    </label>
                    <select
                      value={newContent.type}
                      onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="BLOG">📝 Blog Post</option>
                      <option value="JOB">💼 Job Posting</option>
                      <option value="MESSAGE">💬 Message</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newContent.title}
                      onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter content title..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Body (optional)
                    </label>
                    <textarea
                      value={newContent.body}
                      onChange={(e) => setNewContent(prev => ({ ...prev, body: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter content body..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !newContent.title.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Content'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Content Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Recent Content</h2>
                <p className="text-sm text-gray-600">Latest posts from all users</p>
              </div>
              <div className="divide-y">
                {content.length > 0 ? (
                  content.map(item => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">
                          {item.type === 'BLOG' ? '📝' : item.type === 'JOB' ? '💼' : '💬'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{item.user.username}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                          {item.body && (
                            <p className="text-gray-600">{item.body}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">{item.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <div className="text-4xl mb-4">📝</div>
                    <p>No content yet. Create some content to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Notification Panel */}
      {showNotifications && currentUser && (
        <NotificationPanel
          userId={currentUser.id}
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default Home;
