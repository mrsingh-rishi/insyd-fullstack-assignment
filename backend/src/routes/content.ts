import express from 'express';
import { prisma } from '../index';
import { notificationService } from '../index';
import { ContentType } from '@prisma/client';

const router = express.Router();

// GET /api/content - Get all content
router.get('/', async (req, res) => {
  try {
    const { userId, type, limit = '20' } = req.query;
    
    const whereClause: any = {};
    
    if (userId) {
      whereClause.userId = parseInt(userId as string);
    }
    
    if (type) {
      whereClause.type = type as ContentType;
    }
    
    const content = await prisma.content.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        _count: {
          select: {
            notifications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// GET /api/content/:id - Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        notifications: {
          select: {
            id: true,
            userId: true,
            isRead: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// POST /api/content - Create new content
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, body } = req.body;
    
    // Validation
    if (!userId || !type || !title) {
      return res.status(400).json({ error: 'userId, type, and title are required' });
    }
    
    // Validate content type
    if (!Object.values(ContentType).includes(type)) {
      return res.status(400).json({ error: 'Invalid content type. Must be BLOG, JOB, or MESSAGE' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create content
    const content = await prisma.content.create({
      data: {
        userId,
        type: type as ContentType,
        title,
        body: body || null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    // Create notifications for followers (async, don't wait)
    notificationService.createNotificationsForContent(
      userId, 
      content.id, 
      type, 
      title
    ).then(() => {
      // Process the notification queue
      notificationService.processNotificationQueue().catch(console.error);
    }).catch(console.error);
    
    res.status(201).json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// PUT /api/content/:id - Update content
router.put('/:id', async (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    const { title, body } = req.body;
    
    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id: contentId }
    });
    
    if (!existingContent) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Update content
    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: {
        ...(title && { title }),
        ...(body !== undefined && { body })
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// DELETE /api/content/:id - Delete content
router.delete('/:id', async (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    
    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id: contentId }
    });
    
    if (!existingContent) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Delete content (cascades to related notifications)
    await prisma.content.delete({
      where: { id: contentId }
    });
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// GET /api/content/user/:id/feed - Get content feed for a user (content from people they follow)
router.get('/user/:id/feed', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { limit = '20' } = req.query;
    
    // Get users that this user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    
    const followingIds = following.map(f => f.followingId);
    
    if (followingIds.length === 0) {
      return res.json([]);
    }
    
    // Get content from followed users
    const feed = await prisma.content.findMany({
      where: {
        userId: {
          in: followingIds
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });
    
    res.json(feed);
  } catch (error) {
    console.error('Error fetching user feed:', error);
    res.status(500).json({ error: 'Failed to fetch user feed' });
  }
});

export default router;
