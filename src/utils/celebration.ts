export type CelebrationTiming = 'today' | 'tomorrow';

export interface EventStatus {
  isActive: boolean; // True if either today or tomorrow
  timing: CelebrationTiming | null;
  day: number;
  month: number;
  formattedDisplay: string; // e.g. "20/10"
}

export interface CelebrationStatus {
  birthday: EventStatus;
  anniversary: EventStatus;
  isCelebrationActive: boolean;
  celebrationType: 'combo' | 'birthday' | 'anniversary' | null;
  discountAmount: number; // 250 for combo, 100 for single, 0 if none
  minPurchase: number; // 1000 for combo, 800 for single, 0 if none
  offerTitle: string;
  badgeLabel: string;
}

export function parseMonthDay(dateStr?: string): { month: number; day: number } | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    // YYYY-MM-DD
    if (parts[0].length === 4 && parts.length === 3) {
      return { month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) };
    }
    // DD-MM-YYYY
    if (parts.length === 3 && parts[2].length === 4) {
      return { month: parseInt(parts[1], 10), day: parseInt(parts[0], 10) };
    }
  } else if (clean.includes('/')) {
    const parts = clean.split('/');
    // DD/MM/YYYY
    if (parts.length === 3 && parts[2].length === 4) {
      return { month: parseInt(parts[1], 10), day: parseInt(parts[0], 10) };
    }
    // YYYY/MM/DD
    if (parts.length === 3 && parts[0].length === 4) {
      return { month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) };
    }
  }
  return null;
}

function checkEvent(dateStr?: string, now: Date = new Date()): EventStatus {
  const parsed = parseMonthDay(dateStr);
  if (!parsed || isNaN(parsed.month) || isNaN(parsed.day)) {
    return {
      isActive: false,
      timing: null,
      day: 0,
      month: 0,
      formattedDisplay: '',
    };
  }

  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowMonth = tomorrow.getMonth() + 1;
  const tomorrowDay = tomorrow.getDate();

  const isToday = parsed.month === todayMonth && parsed.day === todayDay;
  const isTomorrow = parsed.month === tomorrowMonth && parsed.day === tomorrowDay;

  const displayDay = String(parsed.day).padStart(2, '0');
  const displayMonth = String(parsed.month).padStart(2, '0');

  return {
    isActive: isToday || isTomorrow,
    timing: isToday ? 'today' : isTomorrow ? 'tomorrow' : null,
    day: parsed.day,
    month: parsed.month,
    formattedDisplay: `${displayDay}/${displayMonth}`,
  };
}

/**
 * Calculates whether a customer is currently inside the 2-day active celebration window
 * (Eve / 1 day in advance + the actual day) for Birthday, Anniversary, or Double Celebration.
 */
export function getCelebrationStatus(
  dob?: string,
  anniversaryDate?: string,
  now: Date = new Date()
): CelebrationStatus {
  const birthday = checkEvent(dob, now);
  const anniversary = checkEvent(anniversaryDate, now);

  const isCombo = birthday.isActive && anniversary.isActive;

  if (isCombo) {
    const isToday = birthday.timing === 'today' || anniversary.timing === 'today';
    return {
      birthday,
      anniversary,
      isCelebrationActive: true,
      celebrationType: 'combo',
      discountAmount: 250,
      minPurchase: 1000,
      offerTitle: 'Double Celebration Offer (₹250 OFF on min. ₹1,000)',
      badgeLabel: isToday ? 'Double Celebration Today' : 'Double Celebration Tomorrow',
    };
  }

  if (birthday.isActive) {
    const isToday = birthday.timing === 'today';
    return {
      birthday,
      anniversary,
      isCelebrationActive: true,
      celebrationType: 'birthday',
      discountAmount: 100,
      minPurchase: 800,
      offerTitle: 'Birthday Special Offer (₹100 OFF on min. ₹800)',
      badgeLabel: isToday ? 'Birthday Today' : 'Birthday Tomorrow',
    };
  }

  if (anniversary.isActive) {
    const isToday = anniversary.timing === 'today';
    return {
      birthday,
      anniversary,
      isCelebrationActive: true,
      celebrationType: 'anniversary',
      discountAmount: 100,
      minPurchase: 800,
      offerTitle: 'Anniversary Special Offer (₹100 OFF on min. ₹800)',
      badgeLabel: isToday ? 'Anniversary Today' : 'Anniversary Tomorrow',
    };
  }

  return {
    birthday,
    anniversary,
    isCelebrationActive: false,
    celebrationType: null,
    discountAmount: 0,
    minPurchase: 0,
    offerTitle: '',
    badgeLabel: '',
  };
}
