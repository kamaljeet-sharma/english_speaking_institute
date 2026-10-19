import { Router } from 'express';
import Enrollment from '../models/Enrollment.js';
import Lecture from '../models/Lecture.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/my', protect, async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id, status: { $ne: 'cancelled' } })
    .populate('course', 'title thumbnail level mode')
    .populate('batch', 'name days timing startDate')
    .sort('-createdAt');

  const result = [];
  for (const e of enrollments) {
    const total = await Lecture.countDocuments({ course: e.course._id });
    result.push({
      ...e.toObject(),
      totalLectures: total,
      progress: total ? Math.round((e.completedLectures.length / total) * 100) : 0,
    });
  }
  res.json(result);
});

export default router;
