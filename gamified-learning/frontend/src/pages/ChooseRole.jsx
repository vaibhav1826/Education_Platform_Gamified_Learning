import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Shield } from 'lucide-react';

const roles = [
  {
    key: 'student',
    title: 'Student',
    description: 'Learn through quests, streaks and rewards.',
    icon: GraduationCap,
    href: '/signup/student',
    accent: 'from-emerald-400/80 to-cyan-400/40'
  },
  {
    key: 'teacher',
    title: 'Teacher',
    description: 'Create courses, quizzes and track cohorts.',
    icon: Users,
    href: '/signup/teacher',
    accent: 'from-indigo-400/80 to-violet-400/40'
  },
  {
    key: 'admin',
    title: 'Admin',
    description: 'Oversee the entire learning universe.',
    icon: Shield,
    href: '/signup/admin',
    accent: 'from-amber-400/90 to-rose-400/40'
  }
];

const ChooseRole = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card-premium rounded-3xl border border-white/10 p-8 md:p-10"
        >
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-accent"
            >
              Choose how you enter the arena
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-sm md:text-base text-slate-300"
            >
              Pick a role to unlock a tailored experience. You can always request role changes from an admin later.
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {roles.map(({ key, title, description, icon: Icon, href, accent }) => (
              <button
                key={key}
                type="button"
                onClick={() => navigate(href)}
                className="group relative flex h-full flex-col items-start rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-glass-card transition hover:-translate-y-1 hover:border-white/30 hover:shadow-neon"
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-black shadow-lg`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mb-1 text-lg font-semibold">{title}</h2>
                <p className="mb-4 text-sm text-slate-300">{description}</p>
                <span className="mt-auto inline-flex items-center text-xs font-semibold text-primary group-hover:text-accent">
                  Continue as {title.toLowerCase()}
                  <span className="ml-1 translate-x-0 transition-transform group-hover:translate-x-1">→</span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChooseRole;


