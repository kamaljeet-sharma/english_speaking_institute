import { Router } from 'express';
import Batch from '../models/Batch.js';
import { adminOnly } from '../middleware/auth.js';
import { crud } from '../utils/crud.js';

const router = Router();
const b = crud(Batch, { populate: ['course', 'teacher'], sort: '-startDate' });

// Admin list, with seats info instead of the whole student array
router.get('/', adminOnly, async (req, res) => {
  const filter = req.query.course ? { course: req.query.course } : {};
  const batches = await Batch.find(filter).populate('course', 'title').populate('teacher', 'name').sort('-startDate');
  res.json(batches.map((x) => ({ ...x.toObject(), enrolled: x.students.length, students: undefined })));
});

router.get('/:id/students', adminOnly, async (req, res) => {
  const batch = await Batch.findById(req.params.id).populate('students', 'name email phone');
  if (!batch) return res.status(404).json({ message: 'Batch not found.' });
  res.json(batch.students);
});

router.post('/', adminOnly, b.create);
router.put('/:id', adminOnly, b.update);
router.delete('/:id', adminOnly, b.remove);

export default router;
