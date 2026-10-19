import { Router } from 'express';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import Lecture from '../models/Lecture.js';
import { adminOnly, optionalAuth } from '../middleware/auth.js';
import { crud } from '../utils/crud.js';

const router = Router();
const c = crud(Course);

router.get('/', optionalAuth, async (req, res) => {
  const filter = req.user?.role === 'admin' ? {} : { isPublished: true };
  if (req.query.level) filter.level = req.query.level;
  res.json(await Course.find(filter).sort('-createdAt'));
});

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });

  const batches = await Batch.find({ course: course._id, status: { $ne: 'completed' } }).sort('startDate');
  const lectureCount = await Lecture.countDocuments({ course: course._id });

  res.json({
    ...course.toObject(),
    lectureCount,
    batches: batches.map((b) => ({
      _id: b._id,
      name: b.name,
      startDate: b.startDate,
      days: b.days,
      timing: b.timing,
      status: b.status,
      seatLimit: b.seatLimit,
      seatsLeft: Math.max(b.seatLimit - b.students.length, 0),
    })),
  });
});

router.post('/', adminOnly, c.create);
router.put('/:id', adminOnly, c.update);
router.delete('/:id', adminOnly, c.remove);

export default router;
