import { getCurrentTime } from '@/store/bootstrap-store';

export interface GetDateNDaysFromTodayArgs {
  days: number; // Number of days from today (positive for future, negative for past)
}

export interface GetDateNDaysFromTodayResult {
  date: string; // Date in DD/MM format
}

/**
 * Get a date N days from today
 * 
 * @param args - Object containing days offset
 *   - days: Number of days from today. Positive for future dates, negative for past dates
 * @returns Object with date in DD/MM format
 * 
 * @example
 * // Get tomorrow's date
 * get_date_N_days_from_today({ days: 1 }) // Returns { date: "29/11" }
 * 
 * @example
 * // Get yesterday's date
 * get_date_N_days_from_today({ days: -1 }) // Returns { date: "27/11" }
 */
export async function get_date_N_days_from_today(
  args: GetDateNDaysFromTodayArgs
): Promise<GetDateNDaysFromTodayResult> {
  const { days } = args;
  
  // Get today's date (respects bootstrap time if set)
  const today = getCurrentTime();
  
  // Calculate target date by adding days
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + days);
  
  // Format as DD/MM
  const day = String(targetDate.getDate()).padStart(2, '0');
  const month = String(targetDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  
  return {
    date: `${day}/${month}`
  };
}

