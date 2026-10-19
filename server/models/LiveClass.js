import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema(
  {
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    title: { type: String, required: true },
    dateTime: { type: Date, required: true },
    durationMins: { type: Number, default: 60 },
    meetingLink: { type: String, required: true }, // Zoom / Google Meet / Jitsi
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    recordingUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model('LiveClass', liveClassSchema);
