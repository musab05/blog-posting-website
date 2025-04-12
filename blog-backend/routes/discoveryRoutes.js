import express from 'express';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

const normalizeSearchResults = (blogs = [], users = []) => {
  return [
    ...blogs.map(blog => ({
      id: blog.id,
      type: 'blog',
      title: blog.title,
      banner: blog.banner,
      shortDescription: blog.shortDescription,
      tags: Array.isArray(blog.tags)
        ? blog.tags
        : JSON.parse(blog.tags || '[]'),
      viewsCount: blog.viewsCount,
      likesCount: blog.likesCount,
      createdAt: blog.createdAt,
      author: {
        id: blog.author.id,
        username: blog.author.username,
        name: blog.author.name,
        profileUrl: blog.author.profileUrl,
      },
    })),
    ...users.map(user => ({
      id: user.id,
      type: 'user',
      username: user.username,
      name: user.name,
      profileUrl: user.profileUrl,
      createdAt: user.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

router.get('/', async (req, res) => {
  try {
    const { page = 1, tab = 'trending' } = req.query;
    const limit = 9;
    const offset = (page - 1) * limit;

    let order;
    switch (tab) {
      case 'recent':
        order = [['createdAt', 'DESC']];
        break;
      case 'popular':
        order = [['viewsCount', 'DESC']];
        break;
      case 'random':
        order = sequelize.random();
        break;
      case 'trending':
      default:
        order = [
          ['likesCount', 'DESC'],
          ['viewsCount', 'DESC'],
        ];
        break;
    }

    const blogs = await Blog.findAll({
      where: { isDraft: false },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'name', 'profileUrl'],
          where: { isPrivate: false },
        },
      ],
      order,
      limit,
      offset,
    });

    const hasMore = blogs.length === limit;

    res.json({ blogs, hasMore });
  } catch (err) {
    console.error('Discover blogs error:', err);
    res.status(500).json({ error: 'Failed to fetch discovery blogs' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long',
      });
    }

    const searchTerm = query.toLowerCase();

    const blogsPromise = Blog.findAll({
      where: {
        isDraft: false,
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), {
            [Op.like]: `%${searchTerm}%`,
          }),
          sequelize.where(
            sequelize.fn(
              'JSON_SEARCH',
              sequelize.col('tags'),
              'one',
              `%${searchTerm}%`
            ),
            {
              [Op.not]: null,
            }
          ),
        ],
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'name', 'profileUrl'],
          where: { isPrivate: false },
        },
      ],
      limit: 20,
    });

    const usersPromise = User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${searchTerm}%` } },
          { name: { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      attributes: ['id', 'username', 'name', 'profileUrl', 'createdAt'],
      limit: 10,
    });

    const [blogs, users] = await Promise.all([blogsPromise, usersPromise]);

    const results = normalizeSearchResults(blogs, users);

    res.json({ results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({
      error: 'Search failed',
      details:
        process.env.NODE_ENV === 'development'
          ? {
              message: err.message,
              stack: err.stack,
            }
          : undefined,
    });
  }
});

export default router;
