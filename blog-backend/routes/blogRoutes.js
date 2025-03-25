import express from 'express';
import { Blog, Comment } from '../models/Blog.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/create', async (req, res) => {
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
      userId,
    } = req.body;


    if (!title || !userId) {
      return res
        .status(400)
        .json({ message: 'Title and User ID are required' });
    }
    console.log(
      type,
      banner,
      (type === 'blog' && !content) , (type === 'video' && !video)
    );
    if (!isDraft) {
      if (
        !type ||
        !banner ||
        (type === 'blog' && !content) ||
        (type === 'video' && !video)
      ) {
        return res
          .status(400)
          .json({ message: 'Missing fields for a published blog' });
      }
    }

    const blog = await Blog.create({
      title,
      isDraft,
      type: isDraft ? null : type,
      banner: isDraft ? null : banner,
      shortDescription: isDraft ? null : shortDescription,
      tags: isDraft ? null : tags,
      content: isDraft && type !== 'blog' ? null : content,
      video: isDraft && type !== 'video' ? null : video,
      userId,
    });

    return res.status(201).json(blog);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/published', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { isDraft: false },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/drafts/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const drafts = await Blog.findAll({
      where: { isDraft: true, userId },
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(drafts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/:blogId/comment', async (req, res) => {
  const { blogId } = req.params;
  const { text, userId, parentId } = req.body;

  if (!text || !userId) {
    return res.status(400).json({ message: 'Text and User ID are required' });
  }

  try {
    const comment = await Comment.create({
      text,
      userId,
      blogId,
      parentId: parentId || null,
    });
    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put('/finalize/:id', async (req, res) => {
  const { id } = req.params;
  const { shortDescription, tags } = req.body;
  console.log("fbvbh", id, shortDescription, tags)

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

    return res.status(200).json({ message: 'Blog finalized and published!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:blogId', async (req, res) => {
  const { blogId } = req.params;
  try {
    const blog = await Blog.findOne({
      where: { id: blogId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'name', 'profileURL'],
        },
        {
          model: Comment,
          as: 'comments',
          where: { parentId: null },
          required: false,
          include: [
            {
              model: Comment,
              as: 'replies',
              required: false,
              include: [
                { model: User, as: 'user', attributes: ['id', 'username'] },
              ],
            },
            { model: User, as: 'user', attributes: ['id', 'username'] },
          ],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    return res.status(200).json(blog);
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



export default router;
