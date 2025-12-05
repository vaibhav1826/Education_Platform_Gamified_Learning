import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, User } from 'lucide-react';
import api from '../../api/index.js';

const BatchLeaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [leaderboardRes, batchRes] = await Promise.all([
        api.get(`/teacher/batches/${id}/leaderboard`),
        api.get(`/teacher/batches/${id}`)
      ]);
      setLeaderboard(leaderboardRes.data);
      setBatch(batchRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
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
        <button
          onClick={() => navigate(`/teacher/batches/${id}`)}
          className="text-slate-400 hover:text-white mb-2"
        >
          ← Back to Batch
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">
          Leaderboard - {batch?.name}
        </h1>
        <p className="text-slate-400">{leaderboard.length} student(s)</p>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Total Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Average %</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Quizzes</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No data available
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, idx) => (
                  <tr
                    key={entry.student._id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">{getRankIcon(idx + 1)}</div>
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
                      <span className="text-lg font-bold text-white">{entry.totalScore}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{entry.averagePercent}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{entry.quizAttempts}</span>
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

export default BatchLeaderboard;

