import express from 'express';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Follow from '../models/Follow.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { Op } from 'sequelize';
import Notification from '../models/Notification.js';
import bcrypt from 'bcryptjs';


const router = express.Router();

const getUserByUsername = async username => {
  return await User.findOne({
    where: { username },
    attributes: [
      'id',
      'name',
      'username',
      'bio',
      'profileUrl',
      'isPrivate',
      'socialLinks',
    ],
  });
};

router.put('/', requireAuth, async (req, res) => {
  try {
    const { name, username, bio, profileUrl, isPrivate, socialLinks } = req.body;
    const userId = req.user.id;
    console.log('Update profile data:', isPrivate);

    const existingUser = await User.findOne({
      where: {
        username,
        id: { [Op.ne]: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    await User.update(
      {
        name,
        username,
        bio,
        profileUrl,
        isPrivate,
        socialLinks
      },
      {
        where: { id: userId }
      }
    );

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'username', 'email', 'bio', 'profileUrl', 'isPrivate', 'socialLinks']
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
      token: req.headers.authorization.split(' ')[1]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
});

router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'username', 'email', 'bio', 'profileUrl', 'isPrivate', 'socialLinks']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});


router.get('/:username', async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followerCount = await Follow.count({
      where: { followingId: user.id, status: { [Op.ne]: 'pending' } },
    });

    const followingCount = await Follow.count({
      where: { followerId: user.id, status: { [Op.ne]: 'pending' } },
    });

    res.json({
      ...user.toJSON(),
      followerCount,
      followingCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching user profile', error: error.message });
  }
});

router.get('/:username/blogs', async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const blogs = await Blog.findAll({
      where: { userId: user.id },
      attributes: [
        'id',
        'title',
        'shortDescription',
        'banner',
        'type',
        'createdAt',
        'likesCount',
        'viewsCount',
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(blogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching blogs', error: error.message });
  }
});

router.get('/:username/followers', async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followers = await Follow.findAll({
      where: { followingId: user.id, status: { [Op.ne]: 'pending' } },
      include: {
        model: User,
        as: 'Follower',
        attributes: ['id', 'name', 'username', 'profileUrl'],
      },
    });

    res.json(followers.map(f => f.Follower));
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching followers', error: error.message });
  }
});

router.get('/:username/following', async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const following = await Follow.findAll({
      where: { followerId: user.id, status: { [Op.ne]: 'pending' } },
      include: {
        model: User,
        as: 'Following',
        attributes: ['id', 'name', 'username', 'profileUrl'],
      },
    });

    res.json(following.map(f => f.Following));
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching following', error: error.message });
  }
});

router.get('/follow/status', requireAuth, async (req, res) => {
  try {
    const { followingId } = req.query;
    const followerId = req.user.id;

    const follow = await Follow.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    const followingUser = await User.findByPk(followingId);
    if (!followingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (follow && !followingUser.isPrivate) {
      follow.status = 'accepted';
      await follow.save();
    }

    res.json({
      isFollowing: !!follow,
      status: follow?.status || null,
      isPrivate: followingUser.isPrivate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error checking follow status', error: error.message });
  }
});

router.post('/follow/:userId', requireAuth, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const followingUser = await User.findByPk(followingId);
    if (!followingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingFollow = await Follow.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      return res.status(400).json({
        message:
          existingFollow.status === 'pending'
            ? 'Follow request already sent'
            : 'Already following this user',
        status: existingFollow.status,
      });
    }

    const status = followingUser.isPrivate ? 'pending' : 'accepted';
    const follow = await Follow.create({
      followerId,
      followingId,
      status,
    });

    if (followingUser.isPrivate) {
      await Notification.create({
        senderId: followerId,
        receiverId: followingId,
        type: 'follow',
        message: `${req.user.username} wants to follow you`,
        isRead: false,
      });
    } else {
      await Notification.create({
        senderId: followerId,
        receiverId: followingId,
        type: 'follow',
        message: `${req.user.username} started following you`,
        isRead: false,
      });
    }

    res.json({
      message: followingUser.isPrivate
        ? 'Follow request sent'
        : 'Now following user',
      status: follow.status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
});

router.delete('/follow/:userId', requireAuth, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    const result = await Follow.destroy({
      where: { followerId, followingId }
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Follow relationship not found' });
    }

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
});

export default router;
