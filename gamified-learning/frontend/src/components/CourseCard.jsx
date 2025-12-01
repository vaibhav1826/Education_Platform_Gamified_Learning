import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const moduleCount = course.modules?.length ?? 0;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass-card"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15 opacity-70" aria-hidden />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
            {course.category || 'Signature Track'}
          </span>
          <span className="text-xs text-slate-400">Level {course.levelRequirement || 1}</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold">{course.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{course.description}</p>
        </div>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
          <span>{moduleCount} modules</span>
          <span>{course.duration || 'Self-paced'}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            {course.reward || '+150 XP'}
          </div>
          <Link
            to={`/courses/${course._id}`}
            className="group relative overflow-hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 opacity-0 transition duration-300 group-hover:opacity-100" />
            <span className="relative flex items-center gap-2">
              Enter Module
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
