import { Router } from 'express';
import User from '../models/User.js';

const router = Router();


router.get('/public', async (_req, res) => {
  const teachers = await User.find({ role: 'teacher', isActive: true, showOnWebsite: { $ne: false } })
    .select('name avatar designation')
    .sort('createdAt');
  res.json(teachers);
});

export default router;