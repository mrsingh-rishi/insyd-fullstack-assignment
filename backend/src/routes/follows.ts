import express from 'express';
import { prisma } from '../index';

const router = express.Router();

// GET /api/follows/user/:id/followers - Get followers of a user
router.get('/user/:id/followers', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.json(followers.map(follow => follow.follower));
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// GET /api/follows/user/:id/following - Get users that a user is following
router.get('/user/:id/following', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.json(following.map(follow => follow.following));
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// POST /api/follows - Follow a user
router.post('/', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    
    // Validation
    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'followerId and followingId are required' });
    }
    
    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    // Check if users exist
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { id: followerId } }),
      prisma.user.findUnique({ where: { id: followingId } })
    ]);
    
    if (!follower || !following) {
      return res.status(404).json({ error: 'One or both users not found' });
    }
    
    // Check if already following
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId,
        followingId
      }
    });
    
    if (existingFollow) {
      return res.status(409).json({ error: 'Already following this user' });
    }
    
    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        following: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json(follow);
  } catch (error) {
    console.error('Error creating follow:', error);
    res.status(500).json({ error: 'Failed to create follow' });
  }
});

// DELETE /api/follows - Unfollow a user
router.delete('/', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    
    // Validation
    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'followerId and followingId are required' });
    }
    
    // Check if follow relationship exists
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId,
        followingId
      }
    });
    
    if (!existingFollow) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }
    
    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        id: existingFollow.id
      }
    });
    
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error deleting follow:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// GET /api/follows/check - Check if a user is following another user
router.get('/check', async (req, res) => {
  try {
    const { followerId, followingId } = req.query;
    
    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'followerId and followingId query parameters are required' });
    }
    
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: parseInt(followerId as string),
        followingId: parseInt(followingId as string)
      }
    });
    
    res.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

export default router;
