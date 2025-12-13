import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        instructions: { type: String, required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        totalPoints: { type: Number, default: 100 },
        dueDate: { type: Date },
        attachments: [{ type: String }] // Links to resources usually
    },
    { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
