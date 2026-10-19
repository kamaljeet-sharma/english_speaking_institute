import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    liveClass: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    present: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
attendanceSchema.index({ liveClass: 1, student: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
