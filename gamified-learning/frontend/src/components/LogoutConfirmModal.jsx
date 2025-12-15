import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', duration: 0.3 }}
                    className="relative w-full max-w-sm mx-4 rounded-2xl border border-white/10 bg-[#0f1014] p-6 shadow-2xl"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Icon */}
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/20 border border-rose-500/30">
                        <LogOut className="w-8 h-8 text-rose-400" />
                    </div>

                    {/* Content */}
                    <h2 className="text-xl font-bold text-white text-center mb-2">
                        Sign Out?
                    </h2>
                    <p className="text-sm text-slate-400 text-center mb-6">
                        Are you sure you want to log out of your account? You'll need to sign in again to access your dashboard.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold transition-all hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <motion.button
                            onClick={onConfirm}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-white font-semibold transition-all hover:bg-rose-600"
                        >
                            Sign Out
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LogoutConfirmModal;
