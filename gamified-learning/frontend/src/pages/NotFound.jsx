import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-lg"
            >
                {/* 404 Display */}
                <div className="relative mb-8">
                    <h1 className="text-[150px] font-bold leading-none bg-gradient-to-r from-primary via-accent to-rose-500 bg-clip-text text-transparent">
                        404
                    </h1>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                        <Search className="w-16 h-16 text-white/20" />
                    </motion.div>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-white mb-3">
                    Page Not Found
                </h2>
                <p className="text-slate-400 mb-8">
                    Oops! The page you're looking for doesn't exist or has been moved.
                    Don't worry, let's get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold transition-transform hover:scale-105 active:scale-95"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold transition-all hover:bg-white/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span className="w-8 h-px bg-slate-700"></span>
                    <span>Error Code: 404</span>
                    <span className="w-8 h-px bg-slate-700"></span>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
