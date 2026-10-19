import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();
const isDemo = () => process.env.PAYMENT_MODE !== 'razorpay';

const razorpay = () =>
  new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex');
const safeEqual = (a, b) => {
  const x = Buffer.from(a || '');
  const y = Buffer.from(b || '');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Idempotent: safe to call from both /verify and the webhook.
async function finalizePayment(payment, razorpayPaymentId) {
  if (payment.status === 'paid') return payment;

  payment.status = 'paid';
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.paidAt = new Date();
  payment.invoiceNo = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  await payment.save();

  await Enrollment.updateOne(
    { student: payment.student, course: payment.course },
    { $setOnInsert: { batch: payment.batch }, $set: { status: 'active' } },
    { upsert: true }
  );
  if (payment.batch) {
    await Batch.updateOne({ _id: payment.batch }, { $addToSet: { students: payment.student } });
  }
  return payment;
}

// 1. Student clicks "Enroll" -> create order
router.post('/order', protect, async (req, res) => {
  const { courseId, batchId } = req.body;
  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) return res.status(404).json({ message: 'Course not found.' });

  const already = await Enrollment.exists({ student: req.user._id, course: course._id, status: 'active' });
  if (already) return res.status(409).json({ message: 'You are already enrolled in this course.' });

  let batch = null;
  if (course.mode !== 'recorded') {
    if (!batchId) return res.status(400).json({ message: 'Please choose a batch.' });
    batch = await Batch.findOne({ _id: batchId, course: course._id });
    if (!batch || batch.status === 'completed')
      return res.status(400).json({ message: 'This batch is not available.' });
    if (batch.students.length >= batch.seatLimit)
      return res.status(400).json({ message: 'This batch is full. Please choose another one.' });
  }

  const payment = await Payment.create({
    student: req.user._id,
    course: course._id,
    batch: batch?._id,
    amount: course.price,
  });

  // Free course: enroll straight away
  if (course.price === 0) {
    await finalizePayment(payment, 'free');
    return res.json({ free: true, paymentId: payment._id });
  }

  if (isDemo()) {
    payment.razorpayOrderId = `order_demo_${payment._id}`;
    await payment.save();
    return res.json({ demo: true, paymentId: payment._id, orderId: payment.razorpayOrderId, amount: course.price * 100, courseTitle: course.title });
  }

  const order = await razorpay().orders.create({
    amount: course.price * 100, // paise
    currency: 'INR',
    receipt: `rcpt_${payment._id}`,
    notes: { paymentId: String(payment._id), student: String(req.user._id) },
  });
  payment.razorpayOrderId = order.id;
  await payment.save();

  res.json({
    paymentId: payment._id,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    courseTitle: course.title,
    prefill: { name: req.user.name, email: req.user.email, contact: req.user.phone },
  });
});

// 2. Browser reports success -> we verify the signature ourselves
router.post('/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

  if (isDemo()) {
    const payment = await Payment.findOne({ _id: paymentId, student: req.user._id });
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    await finalizePayment(payment, `pay_demo_${Date.now()}`);
    return res.json({ message: 'Payment successful (demo).', invoiceNo: payment.invoiceNo });
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, student: req.user._id });
  if (!payment) return res.status(404).json({ message: 'Payment not found.' });

  const expected = hmac(process.env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
  if (!safeEqual(expected, razorpay_signature)) {
    payment.status = 'failed';
    await payment.save();
    return res.status(400).json({ message: 'Payment verification failed.' });
  }

  await finalizePayment(payment, razorpay_payment_id);
  res.json({ message: 'Payment successful.', invoiceNo: payment.invoiceNo });
});

router.get('/my', protect, async (req, res) => {
  const payments = await Payment.find({ student: req.user._id })
    .populate('course', 'title')
    .populate('batch', 'name')
    .sort('-createdAt');
  res.json(payments);
});

router.get('/', adminOnly, async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(
    await Payment.find(filter)
      .populate('student', 'name email phone')
      .populate('course', 'title')
      .populate('batch', 'name')
      .sort('-createdAt')
      .limit(500)
  );
});

// 3. Webhook backup (mounted with express.raw in server.js)
export async function webhookHandler(req, res) {
  const signature = req.headers['x-razorpay-signature'];
  const expected = hmac(process.env.RAZORPAY_WEBHOOK_SECRET || '', req.body);
  if (!safeEqual(expected, signature)) return res.status(400).send('Invalid signature');

  const event = JSON.parse(req.body.toString());
  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const entity = event.payload?.payment?.entity;
    const payment = await Payment.findOne({ razorpayOrderId: entity?.order_id });
    if (payment) await finalizePayment(payment, entity.id);
  }
  res.json({ received: true });
}

export default router;
