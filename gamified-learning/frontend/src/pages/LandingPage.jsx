import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Trophy, Users, BookOpen, Zap, Star, ArrowRight, Gamepad2 } from 'lucide-react';

const LandingPage = () => {
    const features = [
        {
            icon: <Gamepad2 className="w-6 h-6" />,
            title: 'Gamified Learning',
            description: 'Earn XP, unlock badges, and level up as you master new skills.'
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: 'Leaderboards',
            description: 'Compete with peers and climb the ranks in real-time.'
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: 'Rich Courses',
            description: 'Access video lessons, articles, and interactive content.'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Batch Learning',
            description: 'Join cohorts and learn together with classmates.'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6">
                                <Zap className="w-4 h-4" />
                                Level Up Your Learning
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                    Learn Smarter,
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-primary via-accent to-rose-400 bg-clip-text text-transparent">
                                    Play Harder
                                </span>
                            </h1>

                            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                                Transform your education journey with our gamified learning platform.
                                Earn rewards, compete on leaderboards, and achieve your goals.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/choose-role"
                                    className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 bg-white/5 text-white font-semibold text-lg transition-all hover:bg-white/10"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </motion.div>

                        {/* Stats */}
                        {/* Stats - Removed mock data */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                        >
                            {/* Stats will be populated from API later */}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Why Choose Our Platform?
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            We've reimagined online learning to make it engaging, rewarding, and effective.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-accent/10 to-rose-500/10 p-12 text-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),transparent)]" />
                        <div className="relative">
                            <Star className="w-12 h-12 text-accent mx-auto mb-4" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Start Your Journey?
                            </h2>
                            <p className="text-slate-300 max-w-xl mx-auto mb-8">
                                Join thousands of learners who are already leveling up their skills.
                                Create your free account today.
                            </p>
                            <Link
                                to="/choose-role"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-midnight font-bold text-lg transition-all hover:scale-105"
                            >
                                <Rocket className="w-5 h-5" />
                                Create Free Account
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/10">
                <div className="mx-auto max-w-6xl text-center text-sm text-slate-500">
                    <p>© 2024 Gamified Learning Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
