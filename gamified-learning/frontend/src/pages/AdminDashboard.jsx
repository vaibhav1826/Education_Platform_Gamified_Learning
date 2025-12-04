import { motion } from 'framer-motion';

const AdminDashboard = () => {
  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-4"
      >
        Admin Control Center
      </motion.h1>
      <p className="text-slate-300 mb-6">
        This is a basic admin dashboard placeholder. From here you&apos;ll eventually manage courses, teachers, and
        student progress.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card-premium p-4 rounded-2xl">
          <h2 className="font-semibold mb-2">User Overview</h2>
          <p className="text-sm text-slate-400">Coming soon: quick stats about students, teachers, and engagement.</p>
        </div>
        <div className="glass-card-premium p-4 rounded-2xl">
          <h2 className="font-semibold mb-2">Courses</h2>
          <p className="text-sm text-slate-400">Create and manage courses for the platform.</p>
        </div>
        <div className="glass-card-premium p-4 rounded-2xl">
          <h2 className="font-semibold mb-2">Platform Settings</h2>
          <p className="text-sm text-slate-400">Configure gamification, badges, and global settings.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


