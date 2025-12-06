import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Loader2 } from 'lucide-react';
import useLeaderboardData from '../hooks/useLeaderboardData.js';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard = () => {
  const { leaders, loading, error } = useLeaderboardData();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (leaders && leaders.length > 0) {
      setIsInitialLoad(false);
    }
  }, [leaders]);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />;
      case 1:
        return <Medal className="w-8 h-8 text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]" />;
      case 2:
        return <Award className="w-8 h-8 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]" />;
      default:
        return null;
    }
  };

  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]';
      case 1:
        return 'bg-gradient-to-b from-slate-400/20 to-slate-500/10 border-slate-400/50 shadow-[0_0_30px_rgba(148,163,184,0.2)]';
      case 2:
        return 'bg-gradient-to-b from-amber-600/20 to-amber-700/10 border-amber-600/50 shadow-[0_0_30px_rgba(217,119,6,0.2)]';
      default:
        return 'bg-slate-900/40 border-slate-800 hover:border-slate-700';
    }
  };

  // Loading state
  if (loading || isInitialLoad) {
    return (
      <div className="min-h-screen bg-[#030712] p-6 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#030712] to-[#030712]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 relative z-10"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-slate-900/50 rounded-2xl border border-white/10 backdrop-blur-xl">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Leaderboard</h2>
            <p className="text-slate-400">Fetching top performers...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#030712] p-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#030712] to-[#030712]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-md relative z-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4 backdrop-blur-xl">
            <Trophy className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">Unable to Load Leaderboard</h2>
          <p className="text-slate-400">{error || 'Please try again later'}</p>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (!leaders || leaders.length === 0) {
    return (
      <div className="min-h-screen bg-[#030712] p-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030712] to-[#030712]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 relative z-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-2xl mb-4 border border-white/10 backdrop-blur-xl">
            <Trophy className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-3xl font-bold text-white">No Rankings Yet</h2>
          <p className="text-slate-400">Be the first to join the leaderboard!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-amber-600/20 rounded-2xl mb-4 border border-yellow-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          >
            <Trophy className="w-10 h-10 text-yellow-400" />
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            >
              Leaderboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-xl mt-4"
            >
              Top performers this season
            </motion.p>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {leaders.length >= 3 && (
          <div className="flex justify-center items-end gap-6 mb-20 max-w-4xl mx-auto px-4 h-[400px]">
            {leaders.slice(0, 3).map((leader, idx) => {
              const positions = [1, 0, 2]; // 2nd, 1st, 3rd
              const actualIdx = positions.indexOf(idx);
              const heights = ['h-[280px]', 'h-[340px]', 'h-[240px]'];
              const isHovered = hoveredId === leader._id || hoveredId === leader.user?._id;

              return (
                <motion.div
                  key={leader._id || leader.user?._id}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.5 + actualIdx * 0.15,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  className={`flex flex-col items-center w-1/3 ${idx === 1 ? 'order-1 -mt-12 z-20' : idx === 0 ? 'order-0 z-10' : 'order-2 z-10'}`}
                  onMouseEnter={() => setHoveredId(leader._id || leader.user?._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <motion.div
                    animate={{ y: isHovered ? -10 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative mb-6 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${idx === 0 ? 'from-yellow-400 to-amber-600 ring-4 ring-yellow-500/30' :
                        idx === 1 ? 'from-slate-300 to-slate-500 ring-4 ring-slate-400/30' :
                          'from-amber-600 to-amber-800 ring-4 ring-amber-600/30'
                      } flex items-center justify-center text-3xl font-bold text-white shadow-2xl relative z-10 overflow-hidden`}>
                      {leader.user?.profileImage || leader.user?.avatar ? (
                        <img
                          src={(leader.user.profileImage || leader.user.avatar).startsWith('http') 
                            ? (leader.user.profileImage || leader.user.avatar)
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${leader.user.profileImage || leader.user.avatar}`}
                          alt={leader.user?.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span>${leader.user?.name?.charAt(0)?.toUpperCase() || '?'}</span>`;
                          }}
                        />
                      ) : (
                        <span>{leader.user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                      )}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + actualIdx * 0.15, type: "spring" }}
                        className="absolute -top-4 -right-4 bg-black/50 backdrop-blur-md rounded-full p-2 border border-white/10"
                      >
                        {getRankIcon(idx)}
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${heights[idx]} ${getRankStyle(idx)} w-full rounded-t-3xl border-t border-x relative overflow-hidden backdrop-blur-md flex flex-col items-center justify-start pt-8 transition-all duration-300 group`}
                  >
                    {/* Glass shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />

                    <div className="relative z-10 text-center px-4">
                      <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">#{idx + 1}</div>
                      <div className="text-lg font-medium text-white/90 truncate w-full mb-4">
                        {leader.user?.name || 'Unknown'}
                      </div>
                      <div className="inline-block px-4 py-2 rounded-full bg-black/30 border border-white/10 backdrop-blur-sm">
                        <span className="text-xl font-bold text-yellow-400">
                          {leader.xp?.toLocaleString() || '0'}
                        </span>
                        <span className="text-xs text-yellow-400/70 ml-1">XP</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* All Users Leaderboard */}
        <div className="bg-slate-900/20 rounded-3xl border border-white/5 backdrop-blur-sm p-8">
          <AnimatePresence>
            <div className="space-y-4">
              {leaders.map((leader, idx) => {
                const isHovered = hoveredId === leader._id || hoveredId === leader.user?._id;

                return (
                  <motion.div
                    key={leader._id || leader.user?._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 1.2 + idx * 0.05,
                      duration: 0.4
                    }}
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(30, 41, 59, 0.4)"
                    }}
                    className={`${getRankStyle(idx)} rounded-2xl p-4 cursor-pointer transition-all duration-300 group relative overflow-hidden`}
                    onMouseEnter={() => setHoveredId(leader._id || leader.user?._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${idx < 3 ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20' : 'text-slate-400 bg-slate-800/50 border border-slate-700/50'
                          }`}>
                          #{idx + 1}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${idx === 0 ? 'from-yellow-400 to-amber-600' :
                              idx === 1 ? 'from-slate-400 to-slate-600' :
                                idx === 2 ? 'from-amber-600 to-amber-800' :
                                  'from-blue-500 to-purple-600'
                            } flex items-center justify-center text-lg font-bold text-white shadow-lg overflow-hidden`}>
                            {leader.user?.profileImage || leader.user?.avatar ? (
                              <img
                                src={((leader.user.profileImage || leader.user.avatar).startsWith('http')
                                  ? (leader.user.profileImage || leader.user.avatar)
                                  : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${leader.user.profileImage || leader.user.avatar}`)}
                                alt={leader.user?.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<span>${leader.user?.name?.charAt(0)?.toUpperCase() || '?'}</span>`;
                                }}
                              />
                            ) : (
                              <span>{leader.user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                            )}
                          </div>

                          <div>
                            <div className="text-lg font-semibold text-white flex items-center gap-2 group-hover:text-purple-300 transition-colors">
                              {leader.user?.name || 'Unknown Player'}
                              {idx < 3 && getRankIcon(idx)}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-400">
                              <TrendingUp className="w-3 h-3 text-green-400" />
                              <span>Active player</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-2xl font-bold ${idx < 3 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent' : 'text-white'
                          }`}>
                          {leader.xp?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-slate-400">XP</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;