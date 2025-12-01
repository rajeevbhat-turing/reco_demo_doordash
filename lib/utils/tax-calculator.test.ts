import { getTaxRate, calculateTax } from './tax-calculator';

describe('tax-calculator', () => {
  describe('getTaxRate', () => {
    it('should return correct tax rate for California', () => {
      expect(getTaxRate('CA')).toBe(0.0725);
    });

    it('should return correct tax rate for New York', () => {
      expect(getTaxRate('NY')).toBe(0.08);
    });

    it('should return correct tax rate for Oregon (no sales tax)', () => {
      expect(getTaxRate('OR')).toBe(0.0);
    });

    it('should return correct tax rate for New Hampshire (no sales tax)', () => {
      expect(getTaxRate('NH')).toBe(0.0);
    });

    it('should return default rate for unknown state', () => {
      expect(getTaxRate('XX')).toBe(0.06);
    });

    it('should return default rate for empty state', () => {
      expect(getTaxRate('')).toBe(0.06);
    });

    it('should handle case-insensitive state codes', () => {
      expect(getTaxRate('ca')).toBe(0.0725);
      expect(getTaxRate('Ca')).toBe(0.0725);
      expect(getTaxRate('CA')).toBe(0.0725);
    });

    it('should return default rate when state is not provided', () => {
      expect(getTaxRate('')).toBe(0.06);
    });

    it('should return correct tax rate for Texas', () => {
      expect(getTaxRate('TX')).toBe(0.0625);
    });

    it('should return correct tax rate for Florida', () => {
      expect(getTaxRate('FL')).toBe(0.06);
    });

    it('should return correct tax rate for Colorado', () => {
      expect(getTaxRate('CO')).toBe(0.029);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly for California', () => {
      const taxableAmount = 100;
      const tax = calculateTax(taxableAmount, 'CA');
      expect(tax).toBeCloseTo(7.25, 2);
    });

    it('should calculate tax correctly for New York', () => {
      const taxableAmount = 100;
      const tax = calculateTax(taxableAmount, 'NY');
      expect(tax).toBe(8.0);
    });

    it('should return 0 tax for Oregon', () => {
      const taxableAmount = 100;
      const tax = calculateTax(taxableAmount, 'OR');
      expect(tax).toBe(0);
    });

    it('should calculate tax with default rate for unknown state', () => {
      const taxableAmount = 100;
      const tax = calculateTax(taxableAmount, 'XX');
      expect(tax).toBe(6.0);
    });

    it('should handle decimal amounts correctly', () => {
      const taxableAmount = 47.99;
      const tax = calculateTax(taxableAmount, 'CA');
      expect(tax).toBeCloseTo(3.479275, 2);
    });

    it('should handle zero amount', () => {
      const tax = calculateTax(0, 'CA');
      expect(tax).toBe(0);
    });

    it('should handle zip code parameter (currently ignored)', () => {
      const taxableAmount = 100;
      const tax = calculateTax(taxableAmount, 'CA', '90210');
      // Zip code doesn't affect rate currently, so should be same as without zip
      expect(tax).toBeCloseTo(7.25, 2);
    });
  });
});
