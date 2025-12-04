import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext.jsx';
import useStreak from '../hooks/useStreak.js';
import { Award, Zap, Trophy, TrendingUp, Star, Flame, Mail, User, Shield } from 'lucide-react';
import api from '../api/index.js';

const Profile = () => {
  const { user, setUser } = useAuthContext();
  const streak = useStreak();

  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [hoveredBadge, setHoveredBadge] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Animate numbers on mount
  useEffect(() => {
    if (!user) return;
    
    setIsVisible(true);

    const xpInterval = setInterval(() => {
      setAnimatedXP(prev => {
        if (prev >= user.xp) {
          clearInterval(xpInterval);
          return user.xp;
        }
        return Math.min(prev + Math.ceil(user.xp / 50), user.xp);
      });
    }, 20);

    const levelInterval = setInterval(() => {
      setAnimatedLevel(prev => {
        if (prev >= user.level) {
          clearInterval(levelInterval);
          return user.level;
        }
        return prev + 1;
      });
    }, 100);

    const streakInterval = setInterval(() => {
      setAnimatedStreak(prev => {
        if (prev >= streak.count) {
          clearInterval(streakInterval);
          return streak.count;
        }
        return prev + 1;
      });
    }, 80);

    return () => {
      clearInterval(xpInterval);
      clearInterval(levelInterval);
      clearInterval(streakInterval);
    };
  }, [user, streak.count]);

  if (!user) return null;

  const xpToNextLevel = (user.level + 1) * 1000;
  const xpProgress = (user.xp / xpToNextLevel) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Hero Profile Card */}
      <div 
        className={`relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-8 border border-slate-700 shadow-2xl overflow-hidden transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-700/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="relative z-10 space-y-6">
          {/* Profile Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-600 bg-slate-800 overflow-hidden flex items-center justify-center shadow-lg">
                    {preview || user.profileImage ? (
                      <img
                        src={preview || user.profileImage}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-slate-200">
                        {user.name?.charAt(0)?.toUpperCase() || <User className="w-8 h-8 text-slate-300" />}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-900 shadow hover:bg-white"
                    >
                      {uploading ? 'Saving…' : 'Change'}
                    </button>
                    {user.profileImage && !uploading && (
                      <button
                        type="button"
                        onClick={async () => {
                          setUploading(true);
                          try {
                            const { data: updated } = await api.patch('/users/me/profile-image', {
                              profileImage: ''
                            });
                            setPreview(null);
                            setUser(updated);
                          } finally {
                            setUploading(false);
                          }
                        }}
                        className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-200 border border-slate-500 hover:bg-slate-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const localUrl = URL.createObjectURL(file);
                      setPreview(localUrl);
                      setUploading(true);
                      try {
                        const formData = new FormData();
                        formData.append('image', file);
                        const { data: upload } = await api.post('/uploads/profile', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        const { data: updated } = await api.patch('/users/me/profile-image', {
                          profileImage: upload.url
                        });
                        setUser(updated);
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white">
                    {user.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 text-sm font-medium">{user.role}</span>
              </div>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700 transform hover:scale-105 hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
              <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-lg" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {/* Level Card */}
            <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">Level</span>
                <div className="bg-slate-700/50 p-2 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white">{animatedLevel}</div>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>

            {/* XP Card */}
            <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">Experience</span>
                <div className="bg-slate-700/50 p-2 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white">{animatedXP.toLocaleString()}</div>
              <div className="mt-2 text-xs text-slate-500">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                {(xpToNextLevel - user.xp).toLocaleString()} XP to next level
              </div>
            </div>

            {/* Streak Card */}
            <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">Current Streak</span>
                <div className="bg-slate-700/50 p-2 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-white">{animatedStreak}</div>
                <span className="text-slate-400 text-lg">days</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Keep it up! 🔥
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2 mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Progress to Level {user.level + 1}</span>
              <span className="text-slate-300 font-semibold">{user.xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP</span>
            </div>
            <div className="h-4 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 font-medium">
              {Math.round(xpProgress)}% Complete
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div 
        className={`bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-lg">
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">Achievements & Badges</h3>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
            <span className="text-slate-300 text-sm font-semibold">
              {user.badges?.length || 0} Badge{user.badges?.length !== 1 ? 's' : ''} Earned
            </span>
          </div>
        </div>
        
        {user.badges?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {user.badges.map((badge, index) => (
              <div
                key={badge._id}
                className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{ 
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={() => setHoveredBadge(badge._id)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <div className="text-center space-y-3">
                  <div className="text-5xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {badge.icon || '🏆'}
                  </div>
                  <div className="text-sm font-semibold text-white leading-tight">
                    {badge.name}
                  </div>
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-slate-600/0 group-hover:bg-slate-600/10 rounded-xl transition-colors duration-300"></div>
                  
                  {/* Tooltip */}
                  {hoveredBadge === badge._id && badge.description && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-slate-950 text-xs rounded-lg border border-slate-700 whitespace-nowrap z-20 animate-fadeIn shadow-2xl">
                      <div className="text-slate-300">{badge.description}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-950 border-r border-b border-slate-700 rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-slate-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <Award className="w-12 h-12 text-slate-600" />
            </div>
            <p className="text-slate-500 text-lg">No badges yet</p>
            <p className="text-slate-600 text-sm mt-2">Start completing challenges to earn achievements!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;