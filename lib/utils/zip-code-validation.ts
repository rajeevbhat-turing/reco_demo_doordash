/**
 * ZIP/Postal Code Validation Utilities
 * 
 * Supports validation for:
 * - United States: 5 digits (00501-99950)
 * - Canada: 6 alphanumeric (A1A 1A1 format)
 * - Australia: 4 digits (0200-9999)
 * - New Zealand: 4 digits (0110-9999)
 */

export interface ZipCodeValidationResult {
  isValid: boolean;
  error: string;
}

/**
 * Validate US ZIP code (5 digits)
 * - Must be exactly 5 digits
 * - Cannot be all zeros (00000)
 * - Cannot start with invalid prefixes (000-004)
 */
export function validateUSZipCode(zipCode: string): ZipCodeValidationResult {
  // Check if empty
  if (!zipCode || zipCode.trim() === '') {
    return { isValid: false, error: 'ZIP code is required' };
  }

  // Remove any spaces
  const cleaned = zipCode.trim();

  // Check for non-digits
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'ZIP code must contain only numbers' };
  }

  // Check length
  if (cleaned.length !== 5) {
    return { isValid: false, error: 'ZIP code must be 5 digits' };
  }

  // Check for all zeros
  if (cleaned === '00000') {
    return { isValid: false, error: 'Please enter a valid ZIP code' };
  }

  // Check for invalid prefixes (000-004 are not valid US ZIP codes)
  const prefix = parseInt(cleaned.substring(0, 3), 10);
  if (prefix >= 0 && prefix <= 4) {
    return { isValid: false, error: 'Please enter a valid ZIP code' };
  }

  return { isValid: true, error: '' };
}

/**
 * Validate Canadian postal code (A1A 1A1 format)
 * - 6 characters: letter, digit, letter, space (optional), digit, letter, digit
 * - First letter cannot be D, F, I, O, Q, U, W, Z
 */
export function validateCanadianPostalCode(postalCode: string): ZipCodeValidationResult {
  if (!postalCode || postalCode.trim() === '') {
    return { isValid: false, error: 'Postal code is required' };
  }

  // Remove spaces and convert to uppercase
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();

  // Check length
  if (cleaned.length !== 6) {
    return { isValid: false, error: 'Postal code must be 6 characters (e.g., A1A 1A1)' };
  }

  // Check format: letter, digit, letter, digit, letter, digit
  const canadianPostalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/;
  if (!canadianPostalRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid postal code (e.g., A1A 1A1)' };
  }

  return { isValid: true, error: '' };
}

/**
 * Validate Australian postcode (4 digits)
 * - Must be exactly 4 digits
 * - Range: 0200-9999
 */
export function validateAustralianPostcode(postcode: string): ZipCodeValidationResult {
  if (!postcode || postcode.trim() === '') {
    return { isValid: false, error: 'Postcode is required' };
  }

  const cleaned = postcode.trim();

  // Check for non-digits
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Postcode must contain only numbers' };
  }

  // Check length
  if (cleaned.length !== 4) {
    return { isValid: false, error: 'Postcode must be 4 digits' };
  }

  // Check valid range (0200-9999)
  const num = parseInt(cleaned, 10);
  if (num < 200) {
    return { isValid: false, error: 'Please enter a valid postcode' };
  }

  return { isValid: true, error: '' };
}

/**
 * Validate New Zealand postcode (4 digits)
 * - Must be exactly 4 digits
 * - Range: 0110-9999
 */
export function validateNewZealandPostcode(postcode: string): ZipCodeValidationResult {
  if (!postcode || postcode.trim() === '') {
    return { isValid: false, error: 'Postcode is required' };
  }

  const cleaned = postcode.trim();

  // Check for non-digits
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Postcode must contain only numbers' };
  }

  // Check length
  if (cleaned.length !== 4) {
    return { isValid: false, error: 'Postcode must be 4 digits' };
  }

  // Check valid range (0110-9999)
  const num = parseInt(cleaned, 10);
  if (num < 110) {
    return { isValid: false, error: 'Please enter a valid postcode' };
  }

  return { isValid: true, error: '' };
}

/**
 * Validate ZIP/postal code based on country
 */
export function validateZipCode(zipCode: string, country: string = 'United States'): ZipCodeValidationResult {
  switch (country) {
    case 'United States':
      return validateUSZipCode(zipCode);
    case 'Canada':
      return validateCanadianPostalCode(zipCode);
    case 'Australia':
      return validateAustralianPostcode(zipCode);
    case 'New Zealand':
      return validateNewZealandPostcode(zipCode);
    default:
      // Default to US validation
      return validateUSZipCode(zipCode);
  }
}

/**
 * Format ZIP/postal code input based on country
 * - US: digits only, max 5
 * - Canada: alphanumeric, max 7 (with space)
 * - Australia/NZ: digits only, max 4
 */
export function formatZipCodeInput(value: string, country: string = 'United States'): string {
  switch (country) {
    case 'United States':
      // US: digits only, max 5
      return value.replace(/\D/g, '').slice(0, 5);
    
    case 'Canada':
      // Canada: alphanumeric, format as A1A 1A1
      const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
      if (alphanumeric.length > 3) {
        return alphanumeric.slice(0, 3) + ' ' + alphanumeric.slice(3);
      }
      return alphanumeric;
    
    case 'Australia':
    case 'New Zealand':
      // 4 digits only
      return value.replace(/\D/g, '').slice(0, 4);
    
    default:
      // Default: allow alphanumeric, max 10
      return value.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 10);
  }
}

/**
 * Get max length for ZIP/postal code input based on country
 */
export function getZipCodeMaxLength(country: string = 'United States'): number {
  switch (country) {
    case 'United States':
      return 5;
    case 'Canada':
      return 7; // A1A 1A1 with space
    case 'Australia':
    case 'New Zealand':
      return 4;
    default:
      return 10;
  }
}

/**
 * Get placeholder text for ZIP/postal code input based on country
 */
export function getZipCodePlaceholder(country: string = 'United States'): string {
  switch (country) {
    case 'United States':
      return '12345';
    case 'Canada':
      return 'A1A 1A1';
    case 'Australia':
      return '2000';
    case 'New Zealand':
      return '1010';
    default:
      return 'ZIP/Postal code';
  }
}

/**
 * Get label text for ZIP/postal code input based on country
 */
export function getZipCodeLabel(country: string = 'United States'): string {
  switch (country) {
    case 'United States':
      return 'ZIP Code';
    case 'Canada':
      return 'Postal Code';
    case 'Australia':
    case 'New Zealand':
      return 'Postcode';
    default:
      return 'ZIP/Postal Code';
  }
}

