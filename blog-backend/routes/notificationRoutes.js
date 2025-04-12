import express from 'express';
import { Op } from 'sequelize';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Blog from '../models/Blog.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { receiverId: req.user.id },
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'name', 'username', 'profileUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching notifications', error: error.message });
  }
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.update(
      { isRead: true },
      {
        where: {
          id: req.params.id,
          receiverId: req.user.id,
        },
        returning: true,
      }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating notification', error: error.message });
  }
});

router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { receiverId: req.user.id, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, receiverId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

router.post('/:id/accept-follow', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        receiverId: req.user.id,
        type: 'follow',
      },
      include: [{
        model: User,
        as: 'Sender',
        attributes: ['id', 'name', 'username', 'profileUrl']
      }]
    });

    if (!notification) {
      return res.status(404).json({ message: 'Follow request not found' });
    }

    await Follow.update(
      { status: 'accepted' },
      {
        where: {
          followerId: notification.senderId,
          followingId: req.user.id,
        },
      }
    );

    await notification.update({ 
      isRead: true, 
      status: 'accepted',
      message: `${notification.Sender.name}'s follow request accepted`
    });

    const updatedNotification = await Notification.findByPk(notification.id, {
      include: [{
        model: User,
        as: 'Sender',
        attributes: ['id', 'name', 'username', 'profileUrl']
      }]
    });

    res.json({ 
      message: 'Follow request accepted',
      notification: updatedNotification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error accepting follow request',
      error: error.message,
    });
  }
});

router.post('/:id/reject-follow', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        receiverId: req.user.id,
        type: 'follow',
      },
      include: [{
        model: User,
        as: 'Sender',
        attributes: ['id', 'name', 'username', 'profileUrl']
      }]
    });

    if (!notification) {
      return res.status(404).json({ message: 'Follow request not found' });
    }

    await Follow.update(
      { status: 'rejected' },
      {
        where: {
          followerId: notification.senderId,
          followingId: req.user.id,
        },
      }
    );

    await notification.update({ 
      isRead: true, 
      status: 'rejected',
      message: `${notification.Sender.name}'s follow request rejected`
    });

    const updatedNotification = await Notification.findByPk(notification.id, {
      include: [{
        model: User,
        as: 'Sender',
        attributes: ['id', 'name', 'username', 'profileUrl']
      }]
    });

    res.json({ 
      message: 'Follow request rejected',
      notification: updatedNotification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error rejecting follow request',
      error: error.message,
    });
  }
});

router.post('/notify-followers', requireAuth, async (req, res) => {
  try {
    const { blogId } = req.body;
    
    if (!blogId) {
      return res.status(400).json({ message: 'Blog ID is required' });
    }

    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const followers = await Follow.findAll({
      where: {
        followingId: blog.userId,
        status: 'accepted'
      }
    });

    const notifications = await Promise.all(
      followers.map(follower => 
        Notification.create({
          type: 'blog',
          message: `${blog.user.name} published a new blog: ${blog.title}`,
          senderId: blog.userId,
          receiverId: follower.followerId,
          blogId: blog.id,
          status: 'pending'
        })
      )
    );

    res.json({ 
      message: 'Notifications sent to followers',
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error notifying followers',
      error: error.message,
    });
  }
});

export default router;
