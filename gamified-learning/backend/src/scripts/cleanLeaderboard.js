import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Leaderboard from '../models/Leaderboard.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanup = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Find non-students
        const nonStudents = await User.find({ role: { $ne: 'student' } }).select('_id');
        const nonStudentIds = nonStudents.map(u => u._id);

        console.log(`Found ${nonStudentIds.length} non-student users.`);

        if (nonStudentIds.length > 0) {
            const result = await Leaderboard.deleteMany({ user: { $in: nonStudentIds } });
            console.log(`Deleted ${result.deletedCount} entries from Leaderboard.`);
        } else {
            console.log('No non-student entries found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
};

cleanup();
