import { motion } from 'framer-motion';
import useGamification from '../hooks/useGamification.js';
import useCourses from '../hooks/useCourses.js';
import useLeaderboardData from '../hooks/useLeaderboardData.js';
import LeaderboardWidget from '../components/LeaderboardWidget.jsx';
import GamificationProgress from '../components/GamificationProgress.jsx';
import CourseCard from '../components/CourseCard.jsx';

const StudentDashboard = () => {
  const { courses } = useCourses();
  const { leaders } = useLeaderboardData();
  const { user, requirements } = useGamification();

  const highlightCards = [
    { label: 'Current XP', value: `${user?.xp ?? 0} XP`, detail: 'Daily growth +320', accent: 'from-primary/80 to-primary/30' },
    {
      label: 'Learning Streak',
      value: `${user?.streak?.count ?? 1} days`,
      detail: 'Keep momentum going',
      accent: 'from-rose-500/70 to-rose-500/20'
    },
    { label: 'Badges Earned', value: `${user?.badges?.length ?? 0}`, detail: 'Unlock 2 more for a surprise', accent: 'from-emerald-400/70 to-emerald-400/10' }
  ];

  const immersionIdeas = [
    { title: 'Interactive Charts', description: 'Blend GSAP timelines with curved trend lines to highlight XP velocity.', accent: 'from-primary/40 via-primary/10 to-transparent' },
    { title: 'Animated Progress Meters', description: 'Use conic gradients + Framer Motion to visualize mastery per module.', accent: 'from-accent/40 via-accent/10 to-transparent' },
    { title: 'Achievement Popups', description: 'Trigger Lottie bursts and neon toasts whenever a badge or streak unlocks.', accent: 'from-rose-500/40 via-rose-500/10 to-transparent' }
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 p-8 shadow-glass-card"
      >
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-b from-primary/10 via-transparent to-accent/10 blur-3xl" aria-hidden />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Welcome back</p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl">
                {user?.name ? `Ready for your next quest, ${user.name}?` : 'Ready to level up your knowledge?'}
              </h1>
            </div>
            <GamificationProgress xp={user?.xp || 0} requirement={requirements || 100} />
            <div className="grid gap-4 sm:grid-cols-3">
              {highlightCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</div>
                  <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                  <p className="text-xs text-slate-400">{card.detail}</p>
                  <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${card.accent}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Live Mission</p>
            <h3 className="text-2xl font-semibold">Master Neural Algorithms</h3>
            <p className="text-sm text-slate-300">Complete 3 more quantum puzzles to unlock the Lumina badge set.</p>
            <div className="relative mt-4 h-40 w-full overflow-hidden rounded-2xl border border-white/5 bg-black/30">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 260 160" fill="none" strokeWidth="2">
                <defs>
                  <linearGradient id="chart" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 120 C 60 60, 110 140, 160 70 S 240 40, 250 100"
                  stroke="url(#chart)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-[dash_6s_ease-in-out_infinite] [stroke-dasharray:420] [stroke-dashoffset:420]"
                />
                <circle cx="160" cy="70" r="5" fill="#22d3ee" className="animate-pulse" />
                <circle cx="250" cy="100" r="6" fill="#fb7185" className="animate-pulse" />
              </svg>
              <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                Performance Pulse
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl border border-white/10 p-6 shadow-glass-card"
          >
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1 space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Immersive Ideas</p>
                <h2 className="text-2xl font-semibold">Premium UI building blocks</h2>
                <p className="text-sm text-slate-300">
                  Blend card decks, animated meters, neon hover states, and cinematic micro-interactions to craft a luxurious learning flow.
                </p>
              </div>
              <div className="grid flex-1 gap-4 md:grid-cols-3">
                {immersionIdeas.map((idea) => (
                  <div key={idea.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className={`mb-3 h-1 w-16 rounded-full bg-gradient-to-r ${idea.accent}`} />
                    <h3 className="font-semibold">{idea.title}</h3>
                    <p className="mt-2 text-slate-400">{idea.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <div className="space-y-6">
          <LeaderboardWidget data={leaders} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl border border-emerald-400/30 p-5 shadow-neon"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400/80 to-emerald-500/20 p-[2px] shadow-neon">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-black/60 text-xl">✨</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Achievement unlocked</p>
                <h3 className="text-xl font-semibold">Lumina Scholar</h3>
                <p className="text-sm text-slate-300">Complete 5 mastery modules to trigger holographic certificate animations.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default StudentDashboard;