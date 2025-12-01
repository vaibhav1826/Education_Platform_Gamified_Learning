import { useAuthContext } from '../context/AuthContext.jsx';
import useStreak from '../hooks/useStreak.js';

const Profile = () => {
  const { user } = useAuthContext();
  const streak = useStreak();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-2">
        <h2 className="text-3xl font-bold">Profile</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>XP: {user.xp}</p>
        <p>Level: {user.level}</p>
        <p>Current Streak: {streak.count} days</p>
      </div>
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
        <h3 className="text-xl font-semibold mb-3">Badges</h3>
        <div className="flex gap-2 flex-wrap">
          {user.badges?.length ? (
            user.badges.map((badge) => (
              <span key={badge._id} className="bg-slate-800 px-3 py-1 rounded-full text-sm">
                {badge.name}
              </span>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No badges yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;