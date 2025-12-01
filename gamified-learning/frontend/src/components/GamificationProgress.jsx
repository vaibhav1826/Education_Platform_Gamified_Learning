import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const GamificationProgress = ({ xp = 0, requirement = 100 }) => {
  const safeRequirement = Math.max(1, requirement);
  const percentage = Math.min(100, Math.round((xp / safeRequirement) * 100));

  const progressSpring = useSpring(0, { stiffness: 120, damping: 20, mass: 0.8 });
  const width = useTransform(progressSpring, (latest) => `${latest}%`);

  useEffect(() => {
    progressSpring.set(percentage);
  }, [percentage, progressSpring]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-glass-card">
      <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.4em] text-slate-400">
        <span>Level progress</span>
        <span>
          {xp} / {safeRequirement} XP
        </span>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <h3 className="text-2xl font-semibold text-white">
            {percentage}% <span className="text-sm font-normal text-slate-400">towards next mastery</span>
          </h3>
          <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div style={{ width }} className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-rose-400 shadow-neon" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40" />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-300">
            <span className="glow-pill rounded-full px-3 py-1 text-emerald-300">
              +{Math.round(percentage * 1.3)} XP velocity
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">Next badge at 120 XP</span>
          </div>
        </div>
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/5 bg-black/60" />
          <div
            className="absolute inset-2 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-primary via-accent to-primary"
            style={{
              background: `conic-gradient(#22d3ee ${percentage * 3.6}deg, rgba(255,255,255,0.08) ${percentage * 3.6}deg)`
            }}
          />
          <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full bg-midnight text-center text-xs text-slate-300">
            <span className="text-lg font-semibold text-white">{percentage}%</span>
            Synced
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationProgress;