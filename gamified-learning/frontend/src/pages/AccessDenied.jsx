import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldX, Home, LogIn } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext.jsx';

const AccessDenied = ({ requiredRole, userRole }) => {
    const { user } = useAuthContext();

    // Determine the appropriate dashboard based on user role
    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin':
                return '/admin/dashboard';
            case 'teacher':
                return '/teacher/dashboard';
            case 'student':
            default:
                return '/student/dashboard';
        }
    };

    const getRoleLabel = (role) => {
        if (Array.isArray(role)) {
            return role.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' or ');
        }
        return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown';
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center max-w-lg"
            >
                {/* Icon Display */}
                <motion.div
                    animate={{
                        boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.4)', '0 0 0 20px rgba(239, 68, 68, 0)']
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-500/20 border border-rose-500/30 mb-6"
                >
                    <ShieldX className="w-12 h-12 text-rose-400" />
                </motion.div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-white mb-3">
                    Access Denied
                </h1>
                <p className="text-slate-400 mb-6">
                    You don't have permission to access this page.
                </p>

                {/* Role Information */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-8 text-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Required Role:</span>
                        <span className="text-rose-400 font-medium">
                            {getRoleLabel(requiredRole)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Your Role:</span>
                        <span className="text-emerald-400 font-medium">
                            {getRoleLabel(userRole || user?.role)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {user ? (
                        <Link
                            to={getDashboardLink()}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold transition-transform hover:scale-105 active:scale-95"
                        >
                            <Home className="w-5 h-5" />
                            Go to My Dashboard
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold transition-transform hover:scale-105 active:scale-95"
                        >
                            <LogIn className="w-5 h-5" />
                            Sign In
                        </Link>
                    )}
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold transition-all hover:bg-white/10"
                    >
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AccessDenied;
