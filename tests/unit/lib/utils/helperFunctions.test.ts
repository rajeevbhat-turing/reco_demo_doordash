import { isValidEmail, isValidName, generateAvatarColor } from '@/lib/utils/helperFunctions';

describe('helperFunctions', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('user_name@example-domain.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
      expect(isValidEmail('user example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should return false for emails with local part exceeding 64 characters', () => {
      const longLocalPart = 'a'.repeat(65) + '@example.com';
      expect(isValidEmail(longLocalPart)).toBe(false);
    });

    it('should return true for emails with local part exactly 64 characters', () => {
      const exact64LocalPart = 'a'.repeat(64) + '@example.com';
      expect(isValidEmail(exact64LocalPart)).toBe(true);
    });

    it('should handle case sensitivity correctly', () => {
      expect(isValidEmail('USER@EXAMPLE.COM')).toBe(true);
      expect(isValidEmail('User@Example.Com')).toBe(true);
    });
  });

  describe('isValidName', () => {
    it('should return true for valid names with allowed characters', () => {
      expect(isValidName('John')).toBe(true);
      expect(isValidName("John O'Brien")).toBe(true);
      expect(isValidName('Mary-Jane Smith')).toBe(true);
      expect(isValidName('Dr. Jane Doe, Jr.')).toBe(true);
      expect(isValidName('John123')).toBe(true);
      expect(isValidName('Jean-Pierre')).toBe(true);
    });

    it('should return false for names exceeding 119 characters', () => {
      const longName = 'a'.repeat(120);
      expect(isValidName(longName)).toBe(false);
    });

    it('should return true for names exactly 119 characters', () => {
      const exact119Name = 'a'.repeat(119);
      expect(isValidName(exact119Name)).toBe(true);
    });

    it('should return false for names with invalid characters', () => {
      expect(isValidName('John@Doe')).toBe(false);
      expect(isValidName('John#Doe')).toBe(false);
      expect(isValidName('John$Doe')).toBe(false);
      expect(isValidName('John%Doe')).toBe(false);
      expect(isValidName('John^Doe')).toBe(false);
      expect(isValidName('John&Doe')).toBe(false);
      expect(isValidName('John*Doe')).toBe(false);
      expect(isValidName('John(Doe')).toBe(false);
      expect(isValidName('John)Doe')).toBe(false);
      expect(isValidName('John[Doe')).toBe(false);
      expect(isValidName('John]Doe')).toBe(false);
      expect(isValidName('John{Doe')).toBe(false);
      expect(isValidName('John}Doe')).toBe(false);
      expect(isValidName('John|Doe')).toBe(false);
      expect(isValidName('John\\Doe')).toBe(false);
      expect(isValidName('John/Doe')).toBe(false);
      expect(isValidName('John?Doe')).toBe(false);
      expect(isValidName('John!Doe')).toBe(false);
      expect(isValidName('John~Doe')).toBe(false);
      expect(isValidName('John`Doe')).toBe(false);
    });

    it('should handle empty strings', () => {
      // Empty string fails the regex check, so it returns false
      expect(isValidName('')).toBe(false);
    });

    it('should handle names with only spaces', () => {
      expect(isValidName('   ')).toBe(true);
    });
  });

  describe('generateAvatarColor', () => {
    it('should return a color from the predefined array', () => {
      const color = generateAvatarColor('John Doe');
      const validColors = [
        '#f44336',
        '#e91e63',
        '#9c27b0',
        '#673ab7',
        '#3f51b5',
        '#2196f3',
        '#03a9f4',
        '#00bcd4',
        '#009688',
        '#4caf50',
        '#8bc34a',
        '#cddc39',
        '#ffeb3b',
        '#ffc107',
        '#ff9800',
        '#ff5722',
        '#795548',
        '#607d8b',
      ];
      expect(validColors).toContain(color);
    });

    it('should return consistent colors for the same name', () => {
      const name = 'John Doe';
      const color1 = generateAvatarColor(name);
      const color2 = generateAvatarColor(name);
      expect(color1).toBe(color2);
    });

    it('should return different colors for different names', () => {
      const color1 = generateAvatarColor('John Doe');
      const color2 = generateAvatarColor('Jane Smith');
      // Note: This might occasionally fail if hash collision occurs, but unlikely
      expect(color1).not.toBe(color2);
    });

    it('should handle undefined/null/non-string inputs', () => {
      const defaultColor = '#f44336';
      expect(generateAvatarColor(undefined as any)).toBe(defaultColor);
      expect(generateAvatarColor(null as any)).toBe(defaultColor);
      expect(generateAvatarColor(123 as any)).toBe(defaultColor);
    });

    it('should handle empty strings', () => {
      const defaultColor = '#f44336';
      expect(generateAvatarColor('')).toBe(defaultColor);
      expect(generateAvatarColor('   ')).toBe(defaultColor);
    });

    it('should normalize names (trim and lowercase) for consistency', () => {
      const color1 = generateAvatarColor('John Doe');
      const color2 = generateAvatarColor('  JOHN DOE  ');
      expect(color1).toBe(color2);
    });
  });
});
