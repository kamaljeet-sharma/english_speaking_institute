import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  },
  { timestamps: true }
);
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
