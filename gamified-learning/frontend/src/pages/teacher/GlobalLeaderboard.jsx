import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, User } from 'lucide-react';
import api from '../../api/index.js';

const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get('/teacher/leaderboard/global');
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="text-slate-400 font-bold">#{rank}</span>;
  };

  if (loading) {
    return <div className="text-slate-400">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Global Leaderboard</h1>
        <p className="text-slate-400">All students across your batches</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 shadow-glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Batches</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Total Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Quizzes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Level</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No data available
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => (
                  <tr
                    key={entry.student._id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">{getRankIcon(entry.rank)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border-2 border-white/20 bg-black/40 overflow-hidden flex items-center justify-center">
                          {entry.student.profileImage || entry.student.avatar ? (
                            <img
                              src={((entry.student.profileImage || entry.student.avatar).startsWith('http')
                                ? (entry.student.profileImage || entry.student.avatar)
                                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${entry.student.profileImage || entry.student.avatar}`)}
                              alt={entry.student.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className={`text-sm font-semibold text-slate-300 ${entry.student.profileImage || entry.student.avatar ? 'hidden' : ''}`}>
                            {entry.student.name?.charAt(0)?.toUpperCase() || (
                              <User className="w-5 h-5 text-slate-300" />
                            )}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{entry.student.name}</p>
                          <p className="text-xs text-slate-400">{entry.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {entry.batches.slice(0, 2).map((batch, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs"
                          >
                            {batch}
                          </span>
                        ))}
                        {entry.batches.length > 2 && (
                          <span className="px-2 py-1 rounded-lg bg-slate-500/20 text-slate-300 text-xs">
                            +{entry.batches.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-white">{entry.totalScore}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{entry.quizAttempts}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-sm font-semibold">
                        Lv.{entry.student.level || 1}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default GlobalLeaderboard;

