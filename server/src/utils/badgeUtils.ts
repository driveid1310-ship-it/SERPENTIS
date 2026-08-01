import User from '../models/User.js';
import Notification from '../models/Notification.js';

export async function updateUserBadges(userId: string) {
  const user = await User.findById(userId);

  if (!user) return;

  const currentBadges = new Set(user.badges);
  const newlyEarned: string[] = [];

  function unlockBadge(badge: string) {
    if (!currentBadges.has(badge)) {
      currentBadges.add(badge);
      newlyEarned.push(badge);
    }
  }

  if (user.totalReports >= 1) {
    unlockBadge('New Contributor');
  }

  if (user.totalReports >= 10) {
    unlockBadge('Active Reporter');
  }

  if (user.resolvedReports >= 10) {
    unlockBadge('City Guardian');
  }

  if (user.reputationPoints >= 100) {
    unlockBadge('Community Champion');
  }

  user.badges = [...currentBadges];
  await user.save();

  // Create notification only for newly earned badges
  for (const badge of newlyEarned) {
    await Notification.create({
      user: user._id,
      title: 'Badge Unlocked!',
      message: `Congratulations! You earned the "${badge}" badge.`,
      type: 'badge',
    });
  }
}