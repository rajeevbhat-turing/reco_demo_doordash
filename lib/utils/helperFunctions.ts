// Email validation
export const isValidEmail = (email: string) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return false;
  }
  // Check if local part (before @) exceeds 64 characters
  const localPart = email.split('@')[0];
  return localPart.length <= 64;
};

// Name validation
export const isValidName = (name: string) => {
  // Check if name exceeds 119 characters or contains invalid characters
  // Valid characters: letters, numbers, spaces, hyphens, apostrophes, periods, and commas
  if (name.length > 119 || !/^[a-zA-Z0-9\s\-'.,]+$/.test(name)) {
    return false;
  }
  return true;
};

// Generate a consistent color based on the name
export const generateAvatarColor = (name: string) => {
  const colors = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#607d8b",
  ];

  // Handle undefined, null, or non-string names
  if (!name || typeof name !== "string") {
    return colors[0];
  }

  // Normalize the string (trim whitespace and convert to lowercase for consistency)
  const normalizedName = name.trim().toLowerCase();

  // If empty string after normalization, return default color
  if (normalizedName.length === 0) {
    return colors[0];
  }

  // Generate a hash using a more robust algorithm
  let hash = 0;
  for (let i = 0; i < normalizedName.length; i++) {
    const char = normalizedName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Ensure positive number and get color index
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};