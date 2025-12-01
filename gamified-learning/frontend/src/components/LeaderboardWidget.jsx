import { useMemo } from 'react';

const LeaderboardWidget = ({ data }) => {
  const ranked = useMemo(() => [...data].sort((a, b) => b.xp - a.xp).slice(0, 5), [data]);

  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
      <h3 className="text-lg font-semibold mb-3">Top Learners</h3>
      <ol className="space-y-2 text-sm">
        {ranked.map((item, idx) => (
          <li key={item._id || item.user?._id} className="flex justify-between">
            <span className="text-slate-300">{idx + 1}. {item.user?.name}</span>
            <span className="text-accent font-semibold">{item.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default LeaderboardWidget;