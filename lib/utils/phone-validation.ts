// Phone number validation and formatting utilities

interface PhoneValidationRule {
  length: number | number[];
  pattern?: RegExp;
  areaCodeRanges?: { min: number; max: number }[];
  invalidPrefixes?: string[];
  format: (digits: string) => string;
  placeholder: string;
}

// Validation rules for each country
const phoneValidationRules: Record<string, PhoneValidationRule> = {
  US: {
    length: 10,
    // US area codes: first digit 2-9, second digit 0-9, third digit 0-9
    // Cannot start with 0 or 1, and cannot have N11 patterns (like 911, 411)
    areaCodeRanges: [{ min: 200, max: 999 }],
    invalidPrefixes: ['0', '1'],
    format: (digits: string) => {
      if (digits.length === 0) return '';
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    },
    placeholder: '',
  },
  CA: {
    length: 10,
    // Canadian area codes follow same format as US
    areaCodeRanges: [{ min: 200, max: 999 }],
    invalidPrefixes: ['0', '1'],
    format: (digits: string) => {
      if (digits.length === 0) return '';
      if (digits.length <= 3) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    },
    placeholder: '',
  },
  GB: {
    length: 10,
    // UK mobile numbers typically start with 07 and landlines vary
    format: (digits: string) => {
      if (digits.length === 0) return '';
      if (digits.length <= 5) return digits;
      return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
    },
    placeholder: '',
  },
  AU: {
    length: 9,
    // Australian mobile numbers start with 4 (after removing leading 0)
    format: (digits: string) => {
      if (digits.length === 0) return '';
      if (digits.length <= 4) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)}`;
    },
    placeholder: '',
  },
  DE: {
    length: [10, 11],
    format: (digits: string) => {
      if (digits.length === 0) return '';
      if (digits.length <= 4) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    },
    placeholder: '',
  },
  ES: {
    length: 9,
    // Spanish mobile numbers start with 6 or 7
    format: (digits: string) => {
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    },
    placeholder: '',
  },
  FR: {
    length: 9,
    // French mobile numbers start with 6 or 7
    format: (digits: string) => {
      if (digits.length === 0) return '';
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      if (digits.length <= 6)
        return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
      if (digits.length <= 8)
        return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 9)}`;
    },
    placeholder: '',
  },
  MX: {
    length: 10,
    // Mexican mobile numbers
    format: (digits: string) => {
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    },
    placeholder: '',
  },
};

// Default rule for countries not explicitly defined
const defaultRule: PhoneValidationRule = {
  length: [10],
  format: (digits: string) => digits,
  placeholder: '',
};

/**
 * Get the validation rule for a country
 */
export const getPhoneRule = (countryCode: string): PhoneValidationRule => {
  return phoneValidationRules[countryCode] || defaultRule;
};

/**
 * Extract only digits from a phone number string
 */
export const extractDigits = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Format a phone number based on country code
 */
export const formatPhoneNumber = (value: string, countryCode: string): string => {
  const digits = extractDigits(value);
  const rule = getPhoneRule(countryCode);
  return rule.format(digits);
};

/**
 * Get the maximum allowed digits for a country
 */
export const getMaxDigits = (countryCode: string): number => {
  const rule = getPhoneRule(countryCode);
  if (Array.isArray(rule.length)) {
    return Math.max(...rule.length);
  }
  return rule.length;
};

/**
 * Validate a phone number for a specific country
 */
export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
}

export const validatePhoneNumber = (
  phoneNumber: string,
  countryCode: string
): PhoneValidationResult => {
  const digits = extractDigits(phoneNumber);
  const rule = getPhoneRule(countryCode);

  // Check if empty
  if (!digits || digits.length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Check length
  const validLengths = Array.isArray(rule.length) ? rule.length : [rule.length];
  if (!validLengths.includes(digits.length)) {
    const expectedLength =
      validLengths.length === 1
        ? `${validLengths[0]}`
        : `${Math.min(...validLengths)}-${Math.max(...validLengths)}`;
    return {
      isValid: false,
      error: `Phone number must be ${expectedLength} digits for ${countryCode}`,
    };
  }

  // Check invalid prefixes (for US/CA)
  if (rule.invalidPrefixes) {
    for (const prefix of rule.invalidPrefixes) {
      if (digits.startsWith(prefix)) {
        return {
          isValid: false,
          error: `Phone number cannot start with ${prefix}`,
        };
      }
    }
  }

  // Check area code ranges (for US/CA)
  if (rule.areaCodeRanges && digits.length >= 3) {
    const areaCode = parseInt(digits.slice(0, 3), 10);
    const isValidAreaCode = rule.areaCodeRanges.some(
      range => areaCode >= range.min && areaCode <= range.max
    );
    if (!isValidAreaCode) {
      return {
        isValid: false,
        error: 'Invalid area code',
      };
    }

    // Additional US/CA specific validation: exchange code (next 3 digits) cannot start with 0 or 1
    if ((countryCode === 'US' || countryCode === 'CA') && digits.length >= 6) {
      const exchangeFirstDigit = digits[3];
      if (exchangeFirstDigit === '0' || exchangeFirstDigit === '1') {
        return {
          isValid: false,
          error: 'Invalid phone number format',
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Get placeholder text for a country
 */
export const getPhonePlaceholder = (countryCode: string): string => {
  const rule = getPhoneRule(countryCode);
  return rule.placeholder;
};
