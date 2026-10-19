import { Router } from 'express';
import Lecture from '../models/Lecture.js';
import Enrollment from '../models/Enrollment.js';
import { adminOnly, optionalAuth, protect } from '../middleware/auth.js';
import { crud } from '../utils/crud.js';

const router = Router();
const l = crud(Lecture, { populate: [{ path: 'course', select: 'title' }], sort: 'course order' });

// Lectures of a course. Video URLs are only sent to enrolled students/admins
// (or for lectures marked as free preview).
router.get('/course/:courseId', optionalAuth, async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.courseId }).sort('order');
  let hasAccess = req.user?.role === 'admin';
  let completed = [];

  if (req.user && !hasAccess) {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
      status: { $ne: 'cancelled' },
    });
    hasAccess = !!enrollment;
    completed = enrollment?.completedLectures.map(String) || [];
  }

  res.json({
    hasAccess,
    lectures: lectures.map((x) => {
      const unlocked = hasAccess || x.isFree;
      return {
        _id: x._id,
        title: x.title,
        order: x.order,
        durationMins: x.durationMins,
        isFree: x.isFree,
        locked: !unlocked,
        videoUrl: unlocked ? x.videoUrl : undefined,
        notes: unlocked ? x.notes : undefined,
        completed: completed.includes(String(x._id)),
      };
    }),
  });
});

router.post('/:id/complete', protect, async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: 'Lecture not found.' });
  const enrollment = await Enrollment.findOneAndUpdate(
    { student: req.user._id, course: lecture.course },
    { $addToSet: { completedLectures: lecture._id } },
    { new: true }
  );
  if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course.' });
  res.json({ completed: enrollment.completedLectures.length });
});

router.get('/', adminOnly, l.list);
router.post('/', adminOnly, l.create);
router.put('/:id', adminOnly, l.update);
router.delete('/:id', adminOnly, l.remove);

export default router;
