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
        const typedUsersData = usersData as User[];
        const typedContentData = contentData as Content[];
        setUsers(typedUsersData);
        setContent(typedContentData);
        if (typedUsersData.length > 0) {
          setCurrentUser(typedUsersData[0]);
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
      
      setContent(prev => [createdContent as Content, ...prev]);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-x-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-300/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Header */}
      <header className="relative bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white text-xl">🔔</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Real-time Notifications
                </h1>
                <p className="text-sm text-gray-600 font-medium">Stay connected, stay informed</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg ${
                isConnected 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/70 shadow-green-200/50' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200/70 shadow-red-200/50'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'
                }`}></div>
                <span className="text-sm font-semibold">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Notifications Button */}
              {currentUser && (
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 backdrop-blur-sm"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-lg">📬</span>
                    <span>Notifications</span>
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce ring-2 ring-white">
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
          {/* User Selection Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">👥</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Select User</h2>
              </div>
              {users.length > 0 ? (
                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="group relative bg-white/50 hover:bg-white/80 border border-gray-200/50 hover:border-gray-300/50 rounded-xl p-4 transition-all duration-200 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                            user.id === 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' :
                            user.id === 2 ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' :
                            user.id === 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                            'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                          }`}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentUser(user)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              currentUser?.id === user.id
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                            }`}
                          >
                            {currentUser?.id === user.id ? '✓ Current' : 'Select'}
                          </button>
                          {currentUser && currentUser.id !== user.id && (
                            <button
                              onClick={() => handleFollowUser(user.id)}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                              + Follow
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading users...</p>
                </div>
              )}
            </div>

            {/* Create Content Form */}
            {currentUser && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">✏️</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Create Content</h2>
                </div>
                <form onSubmit={handleCreateContent} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Content Type
                    </label>
                    <select
                      value={newContent.type}
                      onChange={(e) => setNewContent(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <option value="BLOG">📝 Blog Post</option>
                      <option value="JOB">💼 Job Posting</option>
                      <option value="MESSAGE">💬 Message</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newContent.title}
                      onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400"
                      placeholder="What's on your mind?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Body (optional)
                    </label>
                    <textarea
                      value={newContent.body}
                      onChange={(e) => setNewContent(prev => ({ ...prev, body: e.target.value }))}
                      className="w-full p-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400 resize-none"
                      rows={4}
                      placeholder="Share more details..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !newContent.title.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Create Content</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Content Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📰</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Recent Content</h2>
                    <p className="text-sm text-gray-600">Latest posts from all users</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200/50">
                {content.length > 0 ? (
                  content.map(item => (
                    <div key={item.id} className="p-6 hover:bg-white/50 transition-all duration-200 group hover:shadow-lg border-b border-gray-100 last:border-b-0 hover:scale-[1.01] hover:rounded-lg">
                      <div className="flex items-start space-x-4">
                        {/* Content Type Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-200 ${
                          item.type === 'BLOG' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          item.type === 'JOB' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}>
                          <span className="text-white">
                            {item.type === 'BLOG' ? '📝' : item.type === 'JOB' ? '💼' : '💬'}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* User Info */}
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-md ${
                              item.user.id === 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' :
                              item.user.id === 2 ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' :
                              item.user.id === 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                              'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                            }`}>
                              {item.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800">{item.user.username}</span>
                              <span className="text-sm text-gray-400 mx-2">•</span>
                              <span className="text-sm text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                            {item.title}
                          </h3>
                          {item.body && (
                            <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                              {item.body}
                            </p>
                          )}
                          
                          {/* Tags and Actions */}
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                              item.type === 'BLOG' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              item.type === 'JOB' ? 'bg-green-100 text-green-700 border border-green-200' :
                              'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}>
                              {item.type === 'BLOG' ? '📝 Blog Post' :
                               item.type === 'JOB' ? '💼 Job Posting' :
                               '💬 Message'}
                            </span>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150">
                                <span className="text-gray-400 hover:text-red-500">❤️</span>
                              </button>
                              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150">
                                <span className="text-gray-400 hover:text-blue-500">💬</span>
                              </button>
                              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150">
                                <span className="text-gray-400 hover:text-green-500">🔄</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">📝</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No content yet</h3>
                    <p className="text-gray-500 mb-6">Create some content to get started and see real-time notifications in action!</p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <span>💡</span>
                      <span>Try creating a blog post, job posting, or message</span>
                    </div>
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
