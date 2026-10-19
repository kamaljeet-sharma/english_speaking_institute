import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    amount: { type: Number, required: true }, // in rupees
    currency: { type: String, default: 'INR' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    invoiceNo: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
