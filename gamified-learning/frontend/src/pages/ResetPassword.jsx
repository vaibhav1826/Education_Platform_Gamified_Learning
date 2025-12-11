import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../api/index.js';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
                    <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 glass-card-premium rounded-2xl p-8 max-w-md w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
                    >
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
                    <p className="text-slate-400 mb-6">
                        Your password has been updated. Redirecting you to login...
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition"
                    >
                        <ArrowLeft size={16} /> Go to login now
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45 }}
                    className="glass-card-premium relative overflow-hidden rounded-2xl p-8"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-70" />

                    <div className="mb-6 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                            className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
                        >
                            <Lock className="w-7 h-7 text-primary" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 flex items-start gap-2 text-sm text-red-300"
                            >
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <label className="text-sm text-slate-400 mb-1 block">New Password</label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3 pr-10 text-sm outline-none placeholder:text-slate-500 focus:border-primary/60 input-glow transition-all"
                                    placeholder="Enter new password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                            <label className="text-sm text-slate-400 mb-1 block">Confirm Password</label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-xl border border-white/10 bg-black/40 p-3 pr-10 text-sm outline-none placeholder:text-slate-500 focus:border-primary/60 input-glow transition-all"
                                    placeholder="Confirm new password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className="text-xs text-slate-500"
                        >
                            Password must be at least 8 characters with uppercase, lowercase, and numbers
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </motion.button>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-center text-sm text-slate-400"
                        >
                            <Link to="/login" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition">
                                <ArrowLeft size={14} /> Back to login
                            </Link>
                        </motion.p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
