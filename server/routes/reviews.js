import { Router } from 'express';
import Review from '../models/Review.js';
import { adminOnly, allow, protect } from '../middleware/auth.js';
import { crud } from '../utils/crud.js';

const router = Router();
const admin = crud(Review, { sort: '-createdAt' });

// Public: approved reviews + average rating
router.get('/public', async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const [reviews, stats] = await Promise.all([
        Review.find({ isApproved: true }).select('-user').sort('-createdAt').limit(limit),
        Review.aggregate([
            { $match: { isApproved: true } },
            { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]),
    ]);
    res.json({
        reviews,
        count: stats[0]?.count || 0,
        average: stats[0] ? Math.round(stats[0].average * 10) / 10 : 0,
    });
});

// Logged-in student: read / write their own review (one per student, needs admin approval)
router.get('/mine', protect, async (req, res) => {
    res.json(await Review.findOne({ user: req.user._id }));
});

router.put('/mine', protect, allow('student'), async (req, res) => {
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();
    const title = String(req.body.title || '').trim().slice(0, 100);
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ message: 'Please choose a rating from 1 to 5 stars.' });
    if (comment.length < 10) return res.status(400).json({ message: 'Please write at least a few words (10 characters).' });
    if (comment.length > 600) return res.status(400).json({ message: 'Please keep your review under 600 characters.' });

    const review = await Review.findOneAndUpdate(
        { user: req.user._id },
        { user: req.user._id, name: req.user.name, title, rating: Math.round(rating), comment, isApproved: false },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ review, message: 'Thank you! Your review will appear on the website once our team approves it.' });
});

// Admin
router.get('/', adminOnly, admin.list);
router.post('/', adminOnly, admin.create);
router.put('/:id', adminOnly, admin.update);
router.delete('/:id', adminOnly, admin.remove);

export default router;