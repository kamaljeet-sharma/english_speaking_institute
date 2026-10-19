import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date, required: true },
    days: [String], // e.g. Mon, Wed, Fri
    timing: String, // e.g. 7:00 PM - 8:00 PM IST
    seatLimit: { type: Number, default: 20 },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['upcoming', 'running', 'completed'], default: 'upcoming' },
  },
  { timestamps: true }
);

export default mongoose.model('Batch', batchSchema);
