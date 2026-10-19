import { Router } from 'express';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import LiveClass from '../models/LiveClass.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(adminOnly);

router.get('/stats', async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 3600 * 1000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const sum = (match) =>
    Payment.aggregate([{ $match: { status: 'paid', ...match } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

  const [students, activeEnrollments, newEnrollments, courses, runningBatches, totalRev, monthRev, monthly, upcomingClasses] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      Enrollment.countDocuments({ status: 'active' }),
      Enrollment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Course.countDocuments(),
      Batch.countDocuments({ status: { $in: ['upcoming', 'running'] } }),
      sum({}),
      sum({ paidAt: { $gte: monthStart } }),
      Payment.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { y: { $year: '$paidAt' }, m: { $month: '$paidAt' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ]),
      LiveClass.find({ dateTime: { $gte: now }, status: 'scheduled' })
        .populate('batch', 'name')
        .sort('dateTime')
        .limit(5),
    ]);

  res.json({
    students,
    activeEnrollments,
    newEnrollments,
    courses,
    runningBatches,
    totalRevenue: totalRev[0]?.total || 0,
    monthRevenue: monthRev[0]?.total || 0,
    monthly: monthly.map((m) => ({ label: `${m._id.m}/${String(m._id.y).slice(2)}`, total: m.total })),
    upcomingClasses,
  });
});

router.get('/students', async (req, res) => {
  const q = (req.query.q || '').trim();
  const filter = { role: 'student' };
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }];
  const students = await User.find(filter).sort('-createdAt').limit(300);
  const enrollments = await Enrollment.find({ student: { $in: students.map((s) => s._id) } })
    .populate('course', 'title')
    .populate('batch', 'name');

  const byStudent = {};
  enrollments.forEach((e) => (byStudent[e.student] ||= []).push({ course: e.course?.title, batch: e.batch?.name }));

  res.json(students.map((s) => ({ ...s.toObject(), enrollments: byStudent[s._id] || [] })));
});

router.patch('/students/:id/toggle', async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'student' });
  if (!user) return res.status(404).json({ message: 'Student not found.' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ isActive: user.isActive });
});

// Teachers (used by the Batch form)
router.get('/teachers', async (_req, res) => {
  res.json(await User.find({ role: { $in: ['teacher', 'admin'] } }).select('name email role'));
});

router.post('/teachers', async (req, res) => {
  const { name, email, phone, password } = req.body;
  const teacher = await User.create({ name, email, phone, password, role: 'teacher' });
  res.status(201).json({ _id: teacher._id, name: teacher.name, email: teacher.email });
});

export default router;
