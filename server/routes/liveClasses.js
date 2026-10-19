import { Router } from 'express';
import LiveClass from '../models/LiveClass.js';
import Batch from '../models/Batch.js';
import Attendance from '../models/Attendance.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { crud } from '../utils/crud.js';

const router = Router();
const lc = crud(LiveClass, { populate: [{ path: 'batch', select: 'name' }], sort: '-dateTime' });

// Student: classes for batches I belong to
router.get('/my', protect, async (req, res) => {
  const batches = await Batch.find({ students: req.user._id }).select('_id');
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const classes = await LiveClass.find({
    batch: { $in: batches.map((b) => b._id) },
    dateTime: { $gte: since },
    status: { $ne: 'cancelled' },
  })
    .populate({ path: 'batch', select: 'name course', populate: { path: 'course', select: 'title' } })
    .sort('dateTime');
  res.json(classes);
});

// Student clicks "Join": we mark attendance and only then hand over the link
router.post('/:id/join', protect, async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) return res.status(404).json({ message: 'Class not found.' });

  const inBatch = await Batch.exists({ _id: liveClass.batch, students: req.user._id });
  if (!inBatch && req.user.role !== 'admin')
    return res.status(403).json({ message: 'You are not enrolled in this batch.' });

  if (req.user.role === 'student') {
    await Attendance.updateOne(
      { liveClass: liveClass._id, student: req.user._id },
      { $setOnInsert: { present: true, joinedAt: new Date() } },
      { upsert: true }
    );
  }
  res.json({ meetingLink: liveClass.meetingLink });
});

router.get('/:id/attendance', adminOnly, async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) return res.status(404).json({ message: 'Class not found.' });
  const batch = await Batch.findById(liveClass.batch).populate('students', 'name email');
  const records = await Attendance.find({ liveClass: liveClass._id });
  const presentIds = new Set(records.map((r) => String(r.student)));
  res.json({
    present: batch.students.filter((s) => presentIds.has(String(s._id))),
    absent: batch.students.filter((s) => !presentIds.has(String(s._id))),
  });
});

router.get('/', adminOnly, lc.list);
router.post('/', adminOnly, lc.create);
router.put('/:id', adminOnly, lc.update);
router.delete('/:id', adminOnly, lc.remove);

export default router;
