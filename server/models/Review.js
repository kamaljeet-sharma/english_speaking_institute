import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        title: { type: String, trim: true, maxlength: 100 }, // e.g. "Student, Spoken English Foundation"
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true, maxlength: 600 },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isApproved: { type: Boolean, default: false }, // only approved reviews show on the website
    },
    { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);