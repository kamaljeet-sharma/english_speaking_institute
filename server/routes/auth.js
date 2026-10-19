import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  city: u.city,
  englishLevel: u.englishLevel,
  avatar: u.avatar,
});

router.post('/register', async (req, res) => {
  const { name, email, phone, password, city, englishLevel } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  // role is always "student" here; admins are created via seed or by another admin
  const user = await User.create({ name, email, phone, password, city, englishLevel, role: 'student' });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || '')))
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  if (!user.isActive)
    return res.status(403).json({ message: 'This account is disabled. Contact the institute.' });
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get('/me', protect, (req, res) => res.json(publicUser(req.user)));

router.put('/me', protect, async (req, res) => {
  for (const f of ['name', 'phone', 'city', 'englishLevel', 'avatar']) {
    if (req.body[f] !== undefined) req.user[f] = req.body[f];
  }
  await req.user.save();
  res.json(publicUser(req.user));
});

router.put('/password', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword || '')))
    return res.status(400).json({ message: 'Current password is incorrect.' });
  if ((req.body.newPassword || '').length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: 'Password updated.' });
});

export default router;
