import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
        required: true
    },
    body: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

commentSchema.index({ discussion: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
