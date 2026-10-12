/**
 * DreamX Timezone Utility
 * Normalizes schedule slots to UTC for storage and converts to user's local timezone for presentation.
 * Supports cross-timezone day shift calculation (e.g. Asia/Kolkata <-> America/New_York).
 */

export interface ScheduleSlotUTC {
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time_utc: string; // HH:mm or HH:mm:ss
  end_time_utc: string;   // HH:mm or HH:mm:ss
}

export interface LocalizedSlot {
  day_of_week: number;
  day_name: string;
  start_time_local: string;
  end_time_local: string;
  timezone: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns the client user's detected IANA timezone or defaults to Asia/Kolkata
 */
export function getUserTimeZone(): string {
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  }
  return 'Asia/Kolkata';
}

/**
 * Converts a UTC schedule slot to the specified target timezone.
 * Handles cross-midnight day wrapping.
 */
export function convertUTCSlotToLocal(
  slot: ScheduleSlotUTC,
  targetTimeZone: string = 'Asia/Kolkata'
): LocalizedSlot {
  // Use a fixed reference base Sunday (2026-01-04 is a Sunday)
  const baseSunday = new Date(Date.UTC(2026, 0, 4));
  const dateForDay = new Date(baseSunday.getTime() + slot.day_of_week * 86400000);

  const [startH, startM] = slot.start_time_utc.split(':').map(Number);
  const [endH, endM] = slot.end_time_utc.split(':').map(Number);

  const startUtcDate = new Date(Date.UTC(
    dateForDay.getUTCFullYear(),
    dateForDay.getUTCMonth(),
    dateForDay.getUTCDate(),
    startH,
    startM
  ));

  const endUtcDate = new Date(Date.UTC(
    dateForDay.getUTCFullYear(),
    dateForDay.getUTCMonth(),
    dateForDay.getUTCDate(),
    endH,
    endM
  ));

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimeZone,
    weekday: 'long',
  });

  const localDayName = dayFormatter.format(startUtcDate);
  const localDayIndex = DAY_NAMES.indexOf(localDayName);

  return {
    day_of_week: localDayIndex !== -1 ? localDayIndex : slot.day_of_week,
    day_name: localDayName,
    start_time_local: timeFormatter.format(startUtcDate),
    end_time_local: timeFormatter.format(endUtcDate),
    timezone: targetTimeZone,
  };
}

/**
 * Formats a currency number in INR or target currency
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  }
  if (currency === 'EUR') {
    return `€${amount.toLocaleString('de-DE')}`;
  }
  return `${currency} ${amount}`;
}
