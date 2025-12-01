import User from '../models/User.js';
import Badge from '../models/Badge.js';
import { updateLeaderboard } from '../controllers/leaderboardController.js';

const XP_RULES = {
  // Daily login XP is intentionally low and awarded at most once per calendar day
  daily_login: 1,
  correct_answer: 10,
  quiz_complete: 50
};

export const getLevelRequirements = (level) => level * 100 + level * level * 10;

const awardBadge = async (user, criteria) => {
  const badge = await Badge.findOne({ criteria });
  if (badge && !user.badges.some((id) => String(id) === String(badge._id))) {
    user.badges.push(badge._id);
  }
};

const handleStreaks = async (user) => {
  const now = new Date();
  let shouldAwardDailyLoginXp = false;

  if (!user.streak.lastLogin) {
    user.streak.count = 1;
    shouldAwardDailyLoginXp = true;
  } else {
    const last = new Date(user.streak.lastLogin);
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.streak.count += 1;
      shouldAwardDailyLoginXp = true;
    } else if (diffDays > 1) {
      user.streak.count = 1;
      shouldAwardDailyLoginXp = true;
    }
  }
  user.streak.lastLogin = now;
  if (user.streak.count === 5) await awardBadge(user, '5_day_streak');
  if (user.streak.count === 10) await awardBadge(user, '10_day_streak');

  return shouldAwardDailyLoginXp;
};

const addXP = (user, amount) => {
  user.xp += amount;
  while (user.xp >= getLevelRequirements(user.level)) {
    user.level += 1;
  }
};

export const applyGamificationEvent = async (userDoc, event, meta = {}) => {
  const user = await User.findById(userDoc._id).populate('badges');
  switch (event) {
    case 'daily_login':
      if (await handleStreaks(user)) {
        addXP(user, XP_RULES.daily_login);
      }
      break;
    case 'quiz_complete':
      addXP(user, XP_RULES.quiz_complete);
      addXP(user, (meta.correct || 0) * XP_RULES.correct_answer);
      if (meta.correct && meta.total && meta.correct === meta.total) await awardBadge(user, 'perfect_quiz');
      break;
    case 'correct_answer':
      addXP(user, XP_RULES.correct_answer);
      break;
    default:
      break;
  }
  await user.save();
  await updateLeaderboard(user);
  return user;
};