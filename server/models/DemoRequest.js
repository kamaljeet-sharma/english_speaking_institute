import mongoose from 'mongoose';

const demoRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    level: String,
    message: String,
    status: { type: String, enum: ['new', 'contacted', 'joined'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('DemoRequest', demoRequestSchema);
