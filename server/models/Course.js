import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    mode: { type: String, enum: ['live', 'recorded', 'both'], default: 'both' },
    price: { type: Number, required: true, min: 0 },
    durationWeeks: { type: Number, default: 8 },
    thumbnail: String,
    syllabus: [String],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
