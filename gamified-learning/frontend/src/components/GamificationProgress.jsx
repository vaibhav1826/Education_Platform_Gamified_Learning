import { useLayoutEffect, useRef, useState } from 'react';

const GamificationProgress = ({ xp = 0, requirement = 100 }) => {
  const barRef = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const safeRequirement = requirement || 1;
    const percentage = Math.min(100, Math.round((xp / safeRequirement) * 100));
    requestAnimationFrame(() => setWidth(percentage));
  }, [xp, requirement]);

  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
      <div className="flex justify-between text-sm">
        <span>Level Progress</span>
        <span>{xp} / {requirement} XP</span>
      </div>
      <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
        <div ref={barRef} style={{ width: `${width}%` }} className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" />
      </div>
    </div>
  );
};

export default GamificationProgress;