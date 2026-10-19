import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }, // empty = for everyone
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
