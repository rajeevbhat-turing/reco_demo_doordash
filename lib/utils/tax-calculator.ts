/**
 * Tax rates by state (simplified version)
 * In production, you'd want to:
 * 1. Use a tax service API (like Avalara, TaxJar, etc.)
 * 2. Store rates in database with effective dates
 * 3. Handle zip code specific rates
 * 4. Handle local tax rates (city, county)
 */

const TAX_RATES: Record<string, number> = {
  // High tax states
  CA: 0.0725, // California: 7.25% (state) + varies by city
  NY: 0.08, // New York: 8% (state) + varies by city
  IL: 0.0625, // Illinois: 6.25%
  WA: 0.065, // Washington: 6.5%

  // Medium tax states
  TX: 0.0625, // Texas: 6.25%
  FL: 0.06, // Florida: 6%
  PA: 0.06, // Pennsylvania: 6%
  OH: 0.0575, // Ohio: 5.75%

  // Lower tax states
  CO: 0.029, // Colorado: 2.9%
  OR: 0.0, // Oregon: 0% (no sales tax)
  NH: 0.0, // New Hampshire: 0% (no sales tax)
  MT: 0.0, // Montana: 0% (no sales tax)
  DE: 0.0, // Delaware: 0% (no sales tax)

  // Default for other states
  DEFAULT: 0.06, // 6% default
};

/**
 * Get tax rate for a given state and optional zip code
 * @param state - Two-letter state code (e.g., 'CA', 'NY')
 * @param zipCode - Optional zip code for more specific rates
 * @returns Tax rate as a decimal (e.g., 0.0725 for 7.25%)
 */
export function getTaxRate(state: string, _zipCode?: string): number {
  if (!state) {
    return TAX_RATES['DEFAULT'];
  }

  const stateUpper = state.toUpperCase();

  // Check if state has a specific rate
  if (TAX_RATES[stateUpper] !== undefined) {
    return TAX_RATES[stateUpper];
  }

  // Future: Could add zip code specific rates here
  // if (_zipCode && ZIP_TAX_RATES[_zipCode]) {
  //   return ZIP_TAX_RATES[_zipCode];
  // }

  // Return default rate if state not found
  return TAX_RATES['DEFAULT'];
}

/**
 * Calculate tax amount
 * @param taxableAmount - Amount to calculate tax on
 * @param state - Two-letter state code
 * @param zipCode - Optional zip code
 * @returns Tax amount
 */
export function calculateTax(taxableAmount: number, state: string, zipCode?: string): number {
  const taxRate = getTaxRate(state, zipCode);
  return taxableAmount * taxRate;
}
