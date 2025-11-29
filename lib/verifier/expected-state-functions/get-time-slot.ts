export interface GetTimeSlotArgs {
  time: string; // Time in format like "3:15 PM", "10:45 AM", etc.
}

export interface GetTimeSlotResult {
  slot: string; // Time slot in format "3:00 PM-3:20 PM"
}

/**
 * Get the 20-minute time slot for a given time
 * Rounds down to the nearest 20-minute interval
 * 
 * @param args - Object containing time
 *   - time: Time string in format "H:MM AM/PM" or "HH:MM AM/PM"
 * @returns Object with slot in format "H:MM AM/PM-H:MM AM/PM"
 * 
 * @example
 * get_time_slot({ time: "3:15 PM" }) // Returns { slot: "3:00 PM-3:20 PM" }
 * 
 * @example
 * get_time_slot({ time: "10:45 AM" }) // Returns { slot: "10:40 AM-11:00 AM" }
 */
export async function get_time_slot(
  args: GetTimeSlotArgs
): Promise<GetTimeSlotResult> {
  const { time } = args;
  
  // Parse the time string (e.g., "3:15 PM")
  const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const match = time.match(timeRegex);
  
  if (!match) {
    throw new Error(`Invalid time format: ${time}. Expected format: "H:MM AM/PM"`);
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  // Create a date object with the time
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  // Round down to nearest 20-minute interval
  const roundedMinutes = Math.floor(minutes / 20) * 20;
  const slotStart = new Date(date);
  slotStart.setMinutes(roundedMinutes);
  
  // Calculate slot end (20 minutes later)
  const slotEnd = new Date(slotStart.getTime() + 20 * 60000);
  
  // Format start time
  const startHours = slotStart.getHours();
  const startMinutes = slotStart.getMinutes();
  const startPeriod = startHours >= 12 ? 'PM' : 'AM';
  const startDisplayHours = startHours % 12 || 12;
  const startDisplayMinutes = startMinutes.toString().padStart(2, '0');
  
  // Format end time
  const endHours = slotEnd.getHours();
  const endMinutes = slotEnd.getMinutes();
  const endPeriod = endHours >= 12 ? 'PM' : 'AM';
  const endDisplayHours = endHours % 12 || 12;
  const endDisplayMinutes = endMinutes.toString().padStart(2, '0');
  
  // Build the slot string
  const slot = `${startDisplayHours}:${startDisplayMinutes} ${startPeriod}-${endDisplayHours}:${endDisplayMinutes} ${endPeriod}`;
  
  return { slot };
}

