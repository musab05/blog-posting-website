import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { nanoid } from 'nanoid';
import { validateEmail, validatePassword } from '../utils/validators.js';

dotenv.config();
const router = express.Router();

router.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

const generateToken = user => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
};

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!validateEmail(email))
      return res.status(400).json({ message: 'Invalid email format' });

    if (!validatePassword(password))
      return res.status(400).json({
        message:
          'Password must be at least 8 characters, include uppercase, lowercase, number & special character',
      });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: 'Email already in use' });

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
    req.session.token = token;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        username: newUser.username,
        email: newUser.email,
        profileEmojiUrl: newUser.profileEmojiUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email))
      return res.status(400).json({ message: 'Invalid email format' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password' });

    const token = generateToken(user);
    req.session.token = token;

    res.json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        email: user.email,
        profileEmojiUrl: user.profileEmojiUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/signout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/profile', (req, res) => {
  const token = req.session.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    res.json({
      message: 'Profile data',
      userId: decoded.id,
      email: decoded.email,
    });
  });
});

export default router;
