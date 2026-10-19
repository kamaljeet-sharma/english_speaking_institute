import { Router } from 'express';
import DemoRequest from '../models/DemoRequest.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  const { name, phone, email, level, message } = req.body;
  if (!name || !phone) return res.status(400).json({ message: 'Name and phone number are required.' });
  await DemoRequest.create({ name, phone, email, level, message });
  res.status(201).json({ message: 'Thanks! We will call you to arrange your free demo class.' });
});

router.get('/', adminOnly, async (_req, res) => res.json(await DemoRequest.find().sort('-createdAt')));

router.put('/:id', adminOnly, async (req, res) => {
  const doc = await DemoRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(doc);
});

export default router;
