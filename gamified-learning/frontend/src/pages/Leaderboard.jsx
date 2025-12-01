import useLeaderboardData from '../hooks/useLeaderboardData.js';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const { leaders } = useLeaderboardData();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-3xl font-bold">Leaderboard</h2>
      <div className="space-y-3">
        {leaders.map((leader, idx) => (
          <motion.div
            key={leader._id || leader.user?._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between"
          >
            <span>{idx + 1}. {leader.user?.name}</span>
            <span className="text-accent font-semibold">{leader.xp} XP</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;