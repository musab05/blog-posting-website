import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import Blog from "../models/Blog.js";
import Follow from "../models/Follow.js";


const router = express.Router();

router.get('/metrics', requireAuth, async (req, res) => {
  try {
    const totalViews = await Blog.sum('viewsCount', {
      where: { userId: req.user.id },
    });

    const totalLikes = await Blog.sum('likesCount', {
      where: { userId: req.user.id },
    });

    const totalFollowers = await Follow.count({
      where: { followerId: req.user.id, status: 'accepted' },
    });

    const pendingFollowers = await Follow.count({
      where: { followerId: req.user.id, status: 'pending' },
    });

    res.json({
      totalViews: totalViews || 0,
      totalLikes: totalLikes || 0,
      totalFollowers,
      pendingFollowers,
    });
  } catch (err) {
    console.error('Metrics error:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});


export default router;