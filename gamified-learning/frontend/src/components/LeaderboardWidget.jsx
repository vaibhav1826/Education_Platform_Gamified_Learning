import { useMemo } from 'react';
import { motion } from 'framer-motion';

const accents = ['from-primary/60 to-accent/50', 'from-emerald-400/40 to-emerald-500/20', 'from-rose-500/40 to-rose-500/10'];

const LeaderboardWidget = ({ data }) => {
  const ranked = useMemo(() => [...data].sort((a, b) => b.xp - a.xp).slice(0, 5), [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel rounded-3xl border border-white/10 p-6 shadow-glass-card"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top Learners</h3>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">Live sync</span>
      </div>
      <ol className="mt-4 space-y-3">
        {ranked.map((item, idx) => (
          <li
            key={item._id || item.user?._id || idx}
            className={`relative flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 ${
              idx < 3 ? 'shadow-neon' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-sm font-bold">
                #{idx + 1}
              </div>
              <div>
                <p className="font-semibold text-white">{item.user?.name || 'Anonymous'}</p>
                <p className="text-xs text-slate-400">{item.user?.role || 'Learner'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald-300">{item.xp} XP</p>
              <div className={`mt-1 h-1 w-24 rounded-full bg-gradient-to-r ${accents[idx] || 'from-white/20 to-white/5'}`} />
            </div>
          </li>
        ))}
      </ol>
    </motion.div>
  );
};

export default LeaderboardWidget;
