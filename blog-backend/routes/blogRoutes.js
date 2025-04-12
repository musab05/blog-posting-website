import express from 'express';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { Op } from 'sequelize';
import View from '../models/View.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Follow from '../models/Follow.js';
import sequelize from '../config/database.js';

const router = express.Router();


async function fetchNestedComments(blogId, parentId = null) {
  const comments = await Comment.findAll({
    where: { blogId, parentId },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'profileUrl'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  for (const comment of comments) {
    comment.dataValues.replies = await fetchNestedComments(blogId, comment.id);
  }

  return comments;
}

router.post('/create', requireAuth, async (req, res) => {
  try {
    const {
      title,
      isDraft,
      type,
      banner,
      shortDescription,
      tags,
      content,
      video,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!isDraft) {
      if (
        !type ||
        !banner ||
        (type === 'blog' && !content) ||
        (type === 'video' && !video)
      ) {
        return res
          .status(400)
          .json({ error: 'Missing required fields for publishing' });
      }
    }

    const blog = await Blog.create({
      title,
      isDraft,
      type: type,
      banner: isDraft ? null : banner,
      shortDescription: isDraft ? null : shortDescription,
      tags: isDraft ? null : tags,
      content: isDraft ? null : content,
      video: isDraft ? null : video,
      userId: req.user.id,
    });

    return res.status(201).json(blog);
  } catch (err) {
    console.error('Create blog error:', err);
    return res.status(500).json({ error: 'Failed to create blog' });
  }
});

router.put('/finalize/:id',requireAuth, async (req, res) => {
  const { id } = req.params;
  const { shortDescription, tags } = req.body;

  if (!shortDescription) {
    return res.status(400).json({ message: 'Short description is required' });
  }

  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.shortDescription = shortDescription;
    blog.tags = tags;
    blog.isDraft = false;
    await blog.save();

    const followers = await Follow.findAll({
      where: {
        followingId: blog.userId,
        status: 'accepted',
      },
    });

    await Promise.all(
      followers.map(follower =>
        Notification.create({
          type: 'blog',
          message: `${req.user.name} published a new blog: ${blog.title}`,
          senderId: blog.userId,
          receiverId: follower.followerId,
          blogId: blog.id,
          status: 'pending',
        })
      )
    );

    return res.status(200).json({ message: 'Blog finalized and published!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/all/published', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { isDraft: false },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'profileUrl', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/all/published/post', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;


    const blogs = await Blog.findAll({
      where: { isDraft: false },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'profileUrl', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({ blogs });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/all/drafts', async (req, res) => {
  try {
    const drafts = await Blog.findAll({
      where: { isDraft: true },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(drafts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/drafts', requireAuth, async (req, res) => {
  try {
    const drafts = await Blog.findAll({
      where: {
        isDraft: true,
        userId: req.user.id,
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(drafts);
  } catch (err) {
    console.error('Get drafts error:', err);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

router.get('/published',requireAuth , async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { isDraft: false, userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/:id/publish', requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not foundd' });
    }

    if (!blog.isDraft) {
      return res.status(400).json({ error: 'Blog is already published' });
    }

    blog.isDraft = false;
    await blog.save();

    res.json({ message: 'Blog published successfully' });
  } catch (err) {
    console.error('Publish blog error:', err);
    res.status(500).json({ error: 'Failed to publish blog' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profileUrl'],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const comments = await fetchNestedComments(req.params.id);

    blog.dataValues.comments = comments;

    res.json(blog);
  } catch (err) {
    console.error('Get blog error:', err);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});


router.post('/:id/view', requireAuth, async (req, res) => {
  try {
    const [view, created] = await View.findOrCreate({
      where: {
        userId: req.user.id,
        blogId: req.params.id,
      },
      defaults: {
        userId: req.user.id,
        blogId: req.params.id,
      },
    });

    if (created) {
      const updatedBlog = await Blog.increment('viewsCount', {
        where: { id: req.params.id },
        returning: true,
      });

      return res.json({
        success: true,
        viewsCount: updatedBlog[1][0].viewsCount,
      });
    }

    const blog = await Blog.findByPk(req.params.id);
    res.json({
      success: true,
      viewsCount: blog.viewsCount,
    });
  } catch (err) {
    console.error('Track view error:', err);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

router.get('/:id/like-status', requireAuth, async (req, res) => {
  try {
    const like = await Like.findOne({
      where: {
        userId: req.user.id,
        blogId: req.params.id
      }
    });
    
    const likesCount = await Like.count({ 
      where: { blogId: req.params.id } 
    });
    
    res.json({ 
      liked: !!like, 
      likesCount: likesCount 
    });
  } catch (err) {
    console.error('Like status error:', err);
    res.status(500).json({ error: 'Failed to check like status' });
  }
});

router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        blogId: req.params.id
      }
    });

    if (existingLike) {
      await existingLike.destroy();
      const updatedCount = await blog.reload('likesCount');
      
      return res.json({
        likesCount: updatedCount.likesCount,
        likedByUser: false
      });
    } else {
      await Like.create({
        userId: req.user.id,
        blogId: req.params.id
      });
      const updatedCount = await blog.reload('likesCount');

      if (blog.userId !== req.user.id) {
        await Notification.create({
          senderId: req.user.id,
          receiverId: blog.userId,
          type: 'like',
          blogId: blog.id,
          message: `${req.user.username} liked your blog "${blog.title}"`,
          isRead: false,
        });
      }
      
      return res.json({
        likesCount: updatedCount.likesCount,
        likedByUser: true
      });
    }
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Failed to process like' });
  }
});

router.post('/:id/comment', requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const comment = await Comment.create({
      text: req.body.text,
      userId: req.user.id,
      blogId: blog.id,
      parentId: req.body.parentId || null,
    });
    if (blog.userId !== req.user.id) {
      await Notification.create({
        senderId: req.user.id,
        receiverId: blog.userId,
        type: 'comment',
        blogId: blog.id,
        commentId: comment.id,
        message: `${req.user.username} commented on your blog "${blog.title}"`,
        isRead: false
      });
    }

    if (req.body.parentId) {
      const parentComment = await Comment.findByPk(req.body.parentId, {
        include: [{ model: User, as: 'author' }]
      });
      
      if (parentComment && parentComment.userId !== req.user.id) {
        await Notification.create({
          senderId: req.user.id,
          receiverId: parentComment.userId,
          type: 'reply',
          blogId: blog.id,
          commentId: comment.id,
          message: `${req.user.username} replied to your comment on "${blog.title}"`,
          isRead: false
        });
      }
    }

    const blogWithComment = await Blog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profileUrl'],
        },
      ],
    });

    if (!blogWithComment) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const comments = await fetchNestedComments(req.params.id);

    blogWithComment.dataValues.comments = comments;

    res.json(blogWithComment);
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.delete('/:blogId/comment/:commentId', requireAuth, async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findOne({
      where: {
        id: commentId,
        blogId,
        userId 
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    await Comment.destroy({
      where: {
        [Op.or]: [
          { id: commentId },
          { parentId: commentId }
        ]
      }
    });

    await Notification.destroy({
      where: {
        [Op.or]: [
          { commentId },
          { 
            type: 'reply',
            blogId,
            message: { [Op.like]: `%${commentId}%` }
          }
        ]
      }
    });

    const blog = await Blog.findByPk(blogId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profileUrl'],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const comments = await fetchNestedComments(blogId);
    blog.dataValues.comments = comments;

    res.json(blog);
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profileUrl'],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found or unauthorized' });
    }

    res.json({
      id: blog.id,
      title: blog.title,
      type: blog.type,
      banner: blog.banner,
      shortDescription: blog.shortDescription,
      tags: blog.tags,
      content: blog.content,
      video: blog.video,
      isDraft: blog.isDraft,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author
    });
  } catch (err) {
    console.error('Get blog for edit error:', err);
    res.status(500).json({ error: 'Failed to fetch blog for editing' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const {
      title,
      isDraft,
      type,
      banner,
      shortDescription,
      tags,
      content,
      video,
    } = req.body;

    const blog = await Blog.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found or unauthorized' });
    }

    if (title) blog.title = title;
    if (isDraft !== undefined) blog.isDraft = isDraft;
    
    if (type && !blog.isDraft) blog.type = type;
    
    if (banner && !blog.isDraft) blog.banner = banner;
    
    if (shortDescription && !blog.isDraft) blog.shortDescription = shortDescription;
    
    if (tags && !blog.isDraft) blog.tags = tags;
    
    if (content && blog.type === 'blog' && !blog.isDraft) blog.content = content;
    
    if (video && blog.type === 'video' && !blog.isDraft) blog.video = video;

    await blog.save();

    const updatedBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profileUrl'],
        },
      ],
    });

    res.json(updatedBlog);
  } catch (err) {
    console.error('Update blog error:', err);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

export default router;