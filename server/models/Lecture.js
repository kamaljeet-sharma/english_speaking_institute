import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true }, // YouTube unlisted / Vimeo / signed CDN URL
    order: { type: Number, default: 1 },
    durationMins: Number,
    isFree: { type: Boolean, default: false }, // free preview
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Lecture', lectureSchema);
