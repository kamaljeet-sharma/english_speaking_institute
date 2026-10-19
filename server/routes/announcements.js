import { Router } from 'express';
import Announcement from '../models/Announcement.js';
import Batch from '../models/Batch.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { crud } from '../utils/crud.js';

const router = Router();
const a = crud(Announcement, { populate: [{ path: 'batch', select: 'name' }] });

router.get('/my', protect, async (req, res) => {
  const batches = await Batch.find({ students: req.user._id }).select('_id');
  const list = await Announcement.find({
    $or: [{ batch: null }, { batch: { $exists: false } }, { batch: { $in: batches.map((b) => b._id) } }],
  })
    .populate('batch', 'name')
    .sort('-createdAt')
    .limit(20);
  res.json(list);
});

router.get('/', adminOnly, a.list);
router.post('/', adminOnly, a.create);
router.put('/:id', adminOnly, a.update);
router.delete('/:id', adminOnly, a.remove);

export default router;
