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
 * This function must be deterministic - same input always produces same output
 * to avoid hydration mismatches between server and client
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  if (trimmed === '') return false;
  
  // Normalize to lowercase for consistent comparison
  const normalized = trimmed.toLowerCase();
  
  // Reject if it starts with the exact dummy pattern
  if (normalized.startsWith(DUMMY_IMAGE_PATTERN.toLowerCase())) {
    return false;
  }
  
  // Reject common dashdoor.test patterns (be specific to avoid false positives)
  if (normalized.startsWith('http://static.dashdoor.test') || 
      normalized.startsWith('https://static.dashdoor.test') ||
      normalized.startsWith('//static.dashdoor.test')) {
    return false;
  }
  
  // For other URLs, check if dashdoor.test is the hostname
  // Only check if URL has a protocol to avoid false positives
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    const afterProtocol = normalized.indexOf('://') + 3;
    if (afterProtocol < normalized.length) {
      // Find where hostname ends (first /, ?, #, or end)
      let hostnameEnd = normalized.length;
      for (let i = afterProtocol; i < normalized.length; i++) {
        if (normalized[i] === '/' || normalized[i] === '?' || normalized[i] === '#') {
          hostnameEnd = i;
          break;
        }
      }
      
      const hostname = normalized.substring(afterProtocol, hostnameEnd);
      
      // Only reject if hostname is exactly dashdoor.test or ends with .dashdoor.test
      if (hostname === 'dashdoor.test' || (hostname.endsWith('.dashdoor.test') && hostname.length > 'dashdoor.test'.length)) {
        return false;
      }
    }
  }
  
  // If we get here, assume the URL is valid (be permissive)
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
 * This function must be deterministic - same input always produces same output
 */
export function getImageWithFallback(
  url: string | null | undefined,
  type: 'logo' | 'user' | 'image' = 'image'
): string {
  // Always return a string to avoid hydration issues
  if (!url || typeof url !== 'string') {
    return getPlaceholderImage(type);
  }
  
  const trimmed = url.trim();
  if (trimmed === '') {
    return getPlaceholderImage(type);
  }
  
  // Use validation function
  if (isValidImageUrl(trimmed)) {
    return trimmed;
  }
  
  return getPlaceholderImage(type);
}

