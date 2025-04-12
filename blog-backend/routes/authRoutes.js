import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { nanoid } from 'nanoid';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

const generateToken = user => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters, include uppercase, lowercase, number & special character',
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    let baseUsername = email.split('@')[0];
    let uniqueUsername = baseUsername;
    let userExists = await User.findOne({
      where: { username: uniqueUsername },
    });

    while (userExists) {
      uniqueUsername = `${baseUsername}-${nanoid(5)}`;
      userExists = await User.findOne({ where: { username: uniqueUsername } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      username: uniqueUsername,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser);

    // Set token in HTTP-only cookie and session
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
    });
    req.session.token = token;

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        profileUrl: newUser.profileUrl,
        isPrivate: newUser.isPrivate,
      },
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password)

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
    });
    req.session.token = token;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profileUrl: user.profileUrl,
        isPrivate: user.isPrivate,
      },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/signout', requireAuth, (req, res) => {
  res.clearCookie('token');
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

router.get('/verify', requireAuth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

export default router;
