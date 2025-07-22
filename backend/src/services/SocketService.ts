import { Server } from 'socket.io';

export class SocketService {
  private io: Server;
  private userSockets: Map<number, string[]> = new Map();
  private socketUsers: Map<string, number> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Add a user and their socket ID to tracking
   */
  addUser(userId: number, socketId: string): void {
    // Track socket to user mapping
    this.socketUsers.set(socketId, userId);
    
    // Track user to sockets mapping (users can have multiple connections)
    const existingSockets = this.userSockets.get(userId) || [];
    this.userSockets.set(userId, [...existingSockets, socketId]);
    
    console.log(`User ${userId} connected with socket ${socketId}`);
  }

  /**
   * Remove a user's socket connection
   */
  removeUser(socketId: string): void {
    const userId = this.socketUsers.get(socketId);
    
    if (userId) {
      // Remove socket from user's socket list
      const userSockets = this.userSockets.get(userId) || [];
      const updatedSockets = userSockets.filter(id => id !== socketId);
      
      if (updatedSockets.length === 0) {
        // User has no more connections
        this.userSockets.delete(userId);
        console.log(`User ${userId} fully disconnected`);
      } else {
        this.userSockets.set(userId, updatedSockets);
      }
      
      // Remove socket to user mapping
      this.socketUsers.delete(socketId);
    }
  }

  /**
   * Check if a user is currently online
   */
  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Send notification to a specific user
   */
  sendNotificationToUser(userId: number, notification: any): boolean {
    const socketIds = this.userSockets.get(userId);
    
    if (!socketIds || socketIds.length === 0) {
      console.log(`User ${userId} is offline, cannot send real-time notification`);
      return false;
    }

    // Send to all of user's socket connections
    socketIds.forEach(socketId => {
      this.io.to(socketId).emit('notification', notification);
    });

    console.log(`Notification sent to user ${userId} on ${socketIds.length} connection(s)`);
    return true;
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: number[], notification: any): number {
    let sentCount = 0;
    
    userIds.forEach(userId => {
      if (this.sendNotificationToUser(userId, notification)) {
        sentCount++;
      }
    });
    
    return sentCount;
  }

  /**
   * Broadcast notification to all connected users
   */
  broadcastNotification(notification: any): void {
    this.io.emit('notification', notification);
    console.log('Notification broadcasted to all connected users');
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): number[] {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Get connection count for a user
   */
  getUserConnectionCount(userId: number): number {
    return this.userSockets.get(userId)?.length || 0;
  }

  /**
   * Get total number of connected sockets
   */
  getTotalConnections(): number {
    return this.socketUsers.size;
  }

  /**
   * Get socket statistics
   */
  getStats() {
    return {
      totalConnections: this.getTotalConnections(),
      onlineUsers: this.getOnlineUsers().length,
      userSockets: Object.fromEntries(this.userSockets)
    };
  }
}
