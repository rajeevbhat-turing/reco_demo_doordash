import { describe, it, expect } from 'vitest';
import {
  validateUSZipCode,
  validateCanadianPostalCode,
  validateAustralianPostcode,
  validateNewZealandPostcode,
  validateZipCode,
  formatZipCodeInput,
  getZipCodeMaxLength,
  getZipCodePlaceholder,
  getZipCodeLabel,
} from '@/lib/utils/zip-code-validation';

describe('zip-code-validation', () => {
  describe('validateUSZipCode', () => {
    it('should accept valid 5-digit ZIP codes', () => {
      expect(validateUSZipCode('12345').isValid).toBe(true);
      expect(validateUSZipCode('90210').isValid).toBe(true);
      expect(validateUSZipCode('00501').isValid).toBe(true); // Holtsville, NY (IRS)
      expect(validateUSZipCode('99950').isValid).toBe(true); // Ketchikan, AK
    });

    it('should reject empty ZIP codes', () => {
      const result = validateUSZipCode('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ZIP code is required');
    });

    it('should reject ZIP codes with less than 5 digits', () => {
      const result = validateUSZipCode('1234');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ZIP code must be 5 digits');
    });

    it('should reject ZIP codes with more than 5 digits', () => {
      const result = validateUSZipCode('123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ZIP code must be 5 digits');
    });

    it('should reject all-zero ZIP code (00000)', () => {
      const result = validateUSZipCode('00000');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid ZIP code');
    });

    it('should reject invalid prefixes (000-004)', () => {
      expect(validateUSZipCode('00012').isValid).toBe(false);
      expect(validateUSZipCode('00112').isValid).toBe(false);
      expect(validateUSZipCode('00212').isValid).toBe(false);
      expect(validateUSZipCode('00312').isValid).toBe(false);
      expect(validateUSZipCode('00412').isValid).toBe(false);
    });

    it('should accept valid prefix 005+ (Puerto Rico starts around 006)', () => {
      expect(validateUSZipCode('00501').isValid).toBe(true);
      expect(validateUSZipCode('00601').isValid).toBe(true);
    });

    it('should reject non-numeric characters', () => {
      const result = validateUSZipCode('1234a');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ZIP code must contain only numbers');
    });
  });

  describe('validateCanadianPostalCode', () => {
    it('should accept valid Canadian postal codes', () => {
      expect(validateCanadianPostalCode('A1A 1A1').isValid).toBe(true);
      expect(validateCanadianPostalCode('K1A0B1').isValid).toBe(true);
      expect(validateCanadianPostalCode('M5V3L9').isValid).toBe(true);
    });

    it('should reject empty postal codes', () => {
      const result = validateCanadianPostalCode('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Postal code is required');
    });

    it('should reject incorrect length', () => {
      const result = validateCanadianPostalCode('A1A1A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Postal code must be 6 characters (e.g., A1A 1A1)');
    });

    it('should reject invalid first characters (D, F, I, O, Q, U, W, Z)', () => {
      expect(validateCanadianPostalCode('D1A1A1').isValid).toBe(false);
      expect(validateCanadianPostalCode('F1A1A1').isValid).toBe(false);
      expect(validateCanadianPostalCode('I1A1A1').isValid).toBe(false);
      expect(validateCanadianPostalCode('O1A1A1').isValid).toBe(false);
      expect(validateCanadianPostalCode('Q1A1A1').isValid).toBe(false);
      expect(validateCanadianPostalCode('U1A1A1').isValid).toBe(false);
      expect(validateCanadianPostalCode('W1A1A1').isValid).toBe(false);
      expect(validateCanadianPostalCode('Z1A1A1').isValid).toBe(false);
    });
  });

  describe('validateAustralianPostcode', () => {
    it('should accept valid 4-digit Australian postcodes', () => {
      expect(validateAustralianPostcode('2000').isValid).toBe(true);
      expect(validateAustralianPostcode('3000').isValid).toBe(true);
      expect(validateAustralianPostcode('0200').isValid).toBe(true);
    });

    it('should reject empty postcodes', () => {
      const result = validateAustralianPostcode('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Postcode is required');
    });

    it('should reject postcodes with wrong length', () => {
      expect(validateAustralianPostcode('123').isValid).toBe(false);
      expect(validateAustralianPostcode('12345').isValid).toBe(false);
    });

    it('should reject postcodes below 0200', () => {
      expect(validateAustralianPostcode('0100').isValid).toBe(false);
      expect(validateAustralianPostcode('0050').isValid).toBe(false);
    });
  });

  describe('validateNewZealandPostcode', () => {
    it('should accept valid 4-digit NZ postcodes', () => {
      expect(validateNewZealandPostcode('1010').isValid).toBe(true);
      expect(validateNewZealandPostcode('6011').isValid).toBe(true);
      expect(validateNewZealandPostcode('0110').isValid).toBe(true);
    });

    it('should reject empty postcodes', () => {
      const result = validateNewZealandPostcode('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Postcode is required');
    });

    it('should reject postcodes with wrong length', () => {
      expect(validateNewZealandPostcode('123').isValid).toBe(false);
      expect(validateNewZealandPostcode('12345').isValid).toBe(false);
    });

    it('should reject postcodes below 0110', () => {
      expect(validateNewZealandPostcode('0100').isValid).toBe(false);
      expect(validateNewZealandPostcode('0050').isValid).toBe(false);
    });
  });

  describe('validateZipCode (country router)', () => {
    it('should route to correct validator based on country', () => {
      expect(validateZipCode('12345', 'United States').isValid).toBe(true);
      expect(validateZipCode('A1A 1A1', 'Canada').isValid).toBe(true);
      expect(validateZipCode('2000', 'Australia').isValid).toBe(true);
      expect(validateZipCode('1010', 'New Zealand').isValid).toBe(true);
    });

    it('should default to US validation for unknown countries', () => {
      expect(validateZipCode('12345', 'Unknown').isValid).toBe(true);
      expect(validateZipCode('1234', 'Unknown').isValid).toBe(false);
    });
  });

  describe('formatZipCodeInput', () => {
    it('should format US ZIP codes (digits only, max 5)', () => {
      expect(formatZipCodeInput('12345', 'United States')).toBe('12345');
      expect(formatZipCodeInput('123456789', 'United States')).toBe('12345');
      expect(formatZipCodeInput('12a34b5', 'United States')).toBe('12345');
    });

    it('should format Canadian postal codes (alphanumeric with space)', () => {
      expect(formatZipCodeInput('a1a1a1', 'Canada')).toBe('A1A 1A1');
      expect(formatZipCodeInput('A1A', 'Canada')).toBe('A1A');
      expect(formatZipCodeInput('a1a1', 'Canada')).toBe('A1A 1');
    });

    it('should format Australian postcodes (digits only, max 4)', () => {
      expect(formatZipCodeInput('2000', 'Australia')).toBe('2000');
      expect(formatZipCodeInput('20000', 'Australia')).toBe('2000');
      expect(formatZipCodeInput('20a0', 'Australia')).toBe('200');
    });

    it('should format NZ postcodes (digits only, max 4)', () => {
      expect(formatZipCodeInput('1010', 'New Zealand')).toBe('1010');
      expect(formatZipCodeInput('10100', 'New Zealand')).toBe('1010');
    });
  });

  describe('getZipCodeMaxLength', () => {
    it('should return correct max length for each country', () => {
      expect(getZipCodeMaxLength('United States')).toBe(5);
      expect(getZipCodeMaxLength('Canada')).toBe(7);
      expect(getZipCodeMaxLength('Australia')).toBe(4);
      expect(getZipCodeMaxLength('New Zealand')).toBe(4);
      expect(getZipCodeMaxLength('Unknown')).toBe(10);
    });
  });

  describe('getZipCodePlaceholder', () => {
    it('should return correct placeholder for each country', () => {
      expect(getZipCodePlaceholder('United States')).toBe('12345');
      expect(getZipCodePlaceholder('Canada')).toBe('A1A 1A1');
      expect(getZipCodePlaceholder('Australia')).toBe('2000');
      expect(getZipCodePlaceholder('New Zealand')).toBe('1010');
    });
  });

  describe('getZipCodeLabel', () => {
    it('should return correct label for each country', () => {
      expect(getZipCodeLabel('United States')).toBe('ZIP Code');
      expect(getZipCodeLabel('Canada')).toBe('Postal Code');
      expect(getZipCodeLabel('Australia')).toBe('Postcode');
      expect(getZipCodeLabel('New Zealand')).toBe('Postcode');
    });
  });
});

