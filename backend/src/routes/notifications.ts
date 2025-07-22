import express from 'express';
import { prisma } from '../index';

const router = express.Router();

// GET /api/notifications/user/:id - Get notifications for a user
router.get('/user/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { limit = '20', unreadOnly = 'false' } = req.query;
    
    const whereClause: any = { userId };
    
    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }
    
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        content: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/user/:id/count - Get notification counts for a user
router.get('/user/:id/count', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const [total, unread] = await Promise.all([
      prisma.notification.count({
        where: { userId }
      }),
      prisma.notification.count({
        where: { 
          userId,
          isRead: false
        }
      })
    ]);
    
    res.json({ total, unread });
  } catch (error) {
    console.error('Error fetching notification counts:', error);
    res.status(500).json({ error: 'Failed to fetch notification counts' });
  }
});

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });
    
    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
      include: {
        content: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/user/:id/read-all - Mark all notifications as read for a user
router.put('/user/:id/read-all', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Update all unread notifications for the user
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });
    
    res.json({ message: `Marked ${result.count} notifications as read` });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });
    
    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId }
    });
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// DELETE /api/notifications/user/:id/clear - Clear all notifications for a user
router.delete('/user/:id/clear', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Delete all notifications for the user
    const result = await prisma.notification.deleteMany({
      where: { userId }
    });
    
    res.json({ message: `Deleted ${result.count} notifications` });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalNotifications, unreadNotifications, notificationsByType] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: {
          id: true
        }
      })
    ]);
    
    const typeStats = notificationsByType.reduce((acc, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      total: totalNotifications,
      unread: unreadNotifications,
      byType: typeStats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
});

export default router;
