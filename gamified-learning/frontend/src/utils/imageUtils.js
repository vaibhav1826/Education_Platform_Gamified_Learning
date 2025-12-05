/**
 * Get the full URL for a profile image
 * @param {string} imagePath - The image path (can be full URL or relative path)
 * @returns {string} Full URL to the image
 */
export const getProfileImageUrl = (imagePath) => {
  if (!imagePath || !imagePath.trim()) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseURL}${imagePath}`;
};

/**
 * Avatar component props helper
 * @param {Object} user - User object with profileImage or avatar
 * @returns {Object} Props for img tag
 */
export const getAvatarProps = (user) => {
  const imageUrl = user?.profileImage || user?.avatar;
  if (!imageUrl || !imageUrl.trim()) return null;
  
  return {
    src: getProfileImageUrl(imageUrl),
    alt: user?.name || 'User',
    onError: (e) => {
      e.target.style.display = 'none';
      const fallback = e.target.nextElementSibling;
      if (fallback) fallback.style.display = 'flex';
    }
  };
};

