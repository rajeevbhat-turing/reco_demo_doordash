/**
 * Password validation utility
 * Validates password strength according to security requirements
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

/**
 * Validates a password against security requirements
 * @param password - The password to validate
 * @param oldPassword - Optional old password to check for reuse
 * @param requirements - Custom requirements (uses defaults if not provided)
 * @returns PasswordValidationResult with isValid flag and error messages
 */
export function validatePassword(
  password: string,
  oldPassword?: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }

  // Check for uppercase letters
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (requirements.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check for special characters
  if (requirements.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  }

  // Check for password reuse
  if (oldPassword && password === oldPassword) {
    errors.push('New password cannot be the same as the old password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets a user-friendly combined error message from validation result
 * @param validationResult - The result from validatePassword
 * @returns A single string with all errors, or empty string if valid
 */
export function getPasswordErrorMessage(validationResult: PasswordValidationResult): string {
  if (validationResult.isValid) {
    return '';
  }
  
  if (validationResult.errors.length === 1) {
    return validationResult.errors[0];
  }
  
  return validationResult.errors.join('. ');
}

/**
 * Checks if a password meets the minimum length requirement
 * @param password - The password to check
 * @param minLength - Minimum length (defaults to 10)
 * @returns true if password meets minimum length
 */
export function isPasswordLongEnough(password: string, minLength: number = 10): boolean {
  return password.length >= minLength;
}

/**
 * Gets password strength as a percentage (0-100)
 * @param password - The password to check
 * @returns Strength percentage based on meeting requirements
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;
  const maxPoints = 5;

  // Length check (1 point)
  if (password.length >= 10) strength++;

  // Uppercase check (1 point)
  if (/[A-Z]/.test(password)) strength++;

  // Lowercase check (1 point)
  if (/[a-z]/.test(password)) strength++;

  // Number check (1 point)
  if (/[0-9]/.test(password)) strength++;

  // Special character check (1 point)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  return (strength / maxPoints) * 100;
}

