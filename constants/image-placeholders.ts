/**
 * Constants for image placeholders and fallback handling
 */

// Placeholder image paths
export const PLACEHOLDER_LOGO = '/placeholder-logo.svg';
export const PLACEHOLDER_IMAGE = '/placeholder.svg';
export const PLACEHOLDER_USER = '/placeholder.svg';

// Dummy link pattern that indicates an image is not available
// This pattern is used in the database to mark unavailable images
export const DUMMY_IMAGE_PATTERN = 'https://static.dashdoor.test';

/**
 * Checks if an image URL is valid (not null, not empty, and not a dummy link)
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  if (url.trim() === '') return false;
  if (url.includes(DUMMY_IMAGE_PATTERN)) return false;
  if (url.includes('dashdoor.test')) return false;
  return true;
}

/**
 * Gets the appropriate placeholder based on image type
 * @param type - 'logo' for logos, 'user' for user avatars, 'image' for general images
 */
export function getPlaceholderImage(type: 'logo' | 'user' | 'image' = 'image'): string {
  switch (type) {
    case 'logo':
      return PLACEHOLDER_LOGO;
    case 'user':
      return PLACEHOLDER_USER;
    case 'image':
    default:
      return PLACEHOLDER_IMAGE;
  }
}

/**
 * Gets a fallback image URL, checking if the provided URL is valid
 * @param url - The image URL to check
 * @param type - The type of image (determines which placeholder to use)
 */
export function getImageWithFallback(
  url: string | null | undefined,
  type: 'logo' | 'user' | 'image' = 'image'
): string {
  if (isValidImageUrl(url)) {
    return url as string;
  }
  return getPlaceholderImage(type);
}

