import { prisma } from '../index';
import { redisClient } from '../index';
import { socketService } from '../index';

export class NotificationService {
  /**
   * Create and store notifications when a user posts content
   */
  async createNotificationsForContent(userId: number, contentId: number, contentType: string, title: string) {
    try {
      // Find followers
      const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true }
      });

      // Map follower IDs
      const followerIds = follows.map((follow) => follow.followerId);

      // Create notification messages
      const notifications = followerIds.map((followerId) => {
        const message = `${title} - New ${contentType.toLowerCase()} by user ${userId}`;
        return {
          userId: followerId,
          contentId,
          type: contentType.toUpperCase(),
          message,
          isRead: false,
        };
      });

      // Store notifications in database
      await prisma.notification.createMany({
        data: notifications
      });

      // Queue notifications for delivery
      await Promise.all(notifications.map((notification) => {
        return redisClient.lPush('notificationQueue', JSON.stringify(notification));
      }));

      console.log(`Notifications created for content ${contentId}`);
      return notifications;
    } catch (error) {
      console.error('Error creating notifications:', error);
      throw error;
    }
  }

  /**
   * Process notifications from queue and deliver to online users
   */
  async processNotificationQueue() {
    try {
      while (true) {
        // Pop from left side of queue
        const notificationString = await redisClient.rPop('notificationQueue');

        if (!notificationString) {
          console.log('No more notifications in queue');
          break;
        }

        // Parse notification object
        const notification = JSON.parse(notificationString);

        // Check if user is online and send real-time notification
        const sent = socketService.sendNotificationToUser(notification.userId, notification);

        if (!sent) {
          console.log(`User ${notification.userId} is offline, delivery postponed`);
        } else {
          console.log(`Notification for content ${notification.contentId} sent`);
        }
      }
    } catch (error) {
      console.error('Error processing notification queue:', error);
      throw error;
    }
  }
}
