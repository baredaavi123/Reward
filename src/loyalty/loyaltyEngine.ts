import { LoyaltySettings } from './types';

export const DEFAULT_LOYALTY_SETTINGS: LoyaltySettings = {
  enabled: true,
  rupeesPerPoint: 500,
  redemptionRate: 80,
  minPointsToRedeem: 5,
};

/**
 * Calculates reward points earned based on transaction amount.
 * Rule: e.g. 1 point for every ₹500 spent on debit/purchase.
 */
export function calculatePointsEarned(
  amount: number,
  settings: LoyaltySettings = DEFAULT_LOYALTY_SETTINGS
): number {
  if (!settings.enabled || !amount || amount <= 0) return 0;
  const threshold = settings.rupeesPerPoint || 500;
  if (threshold <= 0) return 0;
  return Math.floor(amount / threshold);
}

/**
 * Calculates the rupee discount value for a given number of redeemed points.
 * Rule: e.g. 1 point = ₹80 discount.
 */
export function calculateDiscountValue(
  points: number,
  settings: LoyaltySettings = DEFAULT_LOYALTY_SETTINGS
): number {
  if (!settings.enabled || !points || points <= 0) return 0;
  return Math.round(points * (settings.redemptionRate || 80) * 100) / 100;
}

/**
 * Validates whether a redemption request is acceptable.
 * Enforces minimum points restriction (default 5 points).
 */
export function validatePointsRedemption(
  pointsToRedeem: number,
  availablePoints: number,
  settings: LoyaltySettings = DEFAULT_LOYALTY_SETTINGS
): { valid: boolean; error?: string } {
  if (!settings.enabled) {
    return { valid: false, error: 'Reward System is currently disabled in Settings.' };
  }

  if (!pointsToRedeem || pointsToRedeem <= 0) {
    return { valid: false, error: 'Please enter a valid number of points.' };
  }

  const min = settings.minPointsToRedeem || 5;
  if (pointsToRedeem < min) {
    return {
      valid: false,
      error: `Minimum ${min} points are required to redeem (You selected: ${pointsToRedeem} points).`,
    };
  }

  if (pointsToRedeem > availablePoints) {
    return {
      valid: false,
      error: `Customer only has ${availablePoints} points available. Cannot redeem ${pointsToRedeem}.`,
    };
  }

  return { valid: true };
}

// Unicode emoji constants ensure 100% encoding safety across all platforms & bundlers
const EMOJI = {
  sparkles: '\u{2728}',       // ✨
  hearts: '\u{1F495}',         // 💕
  bags: '\u{1F6CD}\u{FE0F}',   // 🛍️
  party: '\u{1F389}',          // 🎉
  diamond: '\u{1F48E}',        // 💎
  star: '\u{2B50}',            // ⭐
  whiteCircle: '\u{26AA}',     // ⚪
  chart: '\u{1F4CA}',          // 📊
  gift: '\u{1F381}',           // 🎁
  ribbonHeart: '\u{1F49D}',    // 💝
  target: '\u{1F3AF}',         // 🎯
  celebrate: '\u{1F973}',      // 🥳
  tulip: '\u{1F337}',          // 🌷
  cake: '\u{1F382}',           // 🎂
  ring: '\u{1F48D}',           // 💍
  bouquet: '\u{1F490}',        // 💐
  card: '\u{1F4B3}',           // 💳
};

/**
 * Formats a ready-to-send WhatsApp notification message for the customer after a purchase or transaction.
 */
export function formatWhatsAppLoyaltyMessage(params: {
  customerName: string;
  pointsEarned?: number;
  purchaseAmount?: number;
  originalAmount?: number;
  celebrationDiscountApplied?: number;
  celebrationType?: 'birthday' | 'anniversary' | 'combo';
  oldPoints?: number;
  totalPoints: number;
  settings?: LoyaltySettings;
  businessName?: string;
}): string {
  const {
    customerName,
    pointsEarned = 0,
    purchaseAmount = 0,
    originalAmount,
    celebrationDiscountApplied = 0,
    celebrationType,
    totalPoints,
    settings = DEFAULT_LOYALTY_SETTINGS,
    businessName = 'Zewar For U by Bhakti',
  } = params;

  const targetPoints = settings.minPointsToRedeem || 5;
  const rewardValue = targetPoints * (settings.redemptionRate || 80);
  const remainingPoints = Math.max(0, targetPoints - totalPoints);

  // Generate visual progress bar (e.g. [ ⭐ ⭐ ⭐ ⚪ ⚪ ])
  const filledStars = Math.min(targetPoints, Math.max(0, totalPoints));
  const emptyStars = Math.max(0, targetPoints - filledStars);
  const progressBar = `${(EMOJI.star + ' ').repeat(filledStars)}${(EMOJI.whiteCircle + ' ').repeat(emptyStars)}`.trim();

  let message = `${EMOJI.sparkles} Thank you, *${customerName}*, for shopping with *${businessName}*! ${EMOJI.hearts}\n\n`;

  if (purchaseAmount > 0) {
    if (celebrationDiscountApplied > 0 && originalAmount) {
      const formattedOrig = originalAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      const formattedDisc = celebrationDiscountApplied.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      const formattedNet = purchaseAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      const label =
        celebrationType === 'combo'
          ? `${EMOJI.party} *Double Celebration Offer:* -₹${formattedDisc}`
          : celebrationType === 'birthday'
          ? `${EMOJI.cake} *Birthday Special Gift:* -₹${formattedDisc}`
          : `${EMOJI.ring} *Anniversary Special Gift:* -₹${formattedDisc}`;

      message += `${EMOJI.bags} *Purchase Amount:* ₹${formattedOrig}\n`;
      message += `${label}\n`;
      message += `${EMOJI.card} *Net Amount Paid:* ₹${formattedNet}\n`;
    } else {
      const formattedAmount = purchaseAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      message += `${EMOJI.bags} *Purchase Amount:* ₹${formattedAmount}\n`;
    }
  }

  if (pointsEarned > 0) {
    const pointsLabel = pointsEarned === 1 ? '1 Reward Point' : `${pointsEarned} Reward Points`;
    message += `${EMOJI.party} *Points Earned Today:* +${pointsLabel}\n\n`;
  } else if (purchaseAmount > 0) {
    message += `\n`;
  }

  message += `${EMOJI.diamond} *YOUR LOYALTY CARD*\n`;
  message += `${EMOJI.star} *Current Balance:* ${totalPoints} / ${targetPoints} Points\n`;
  message += `${EMOJI.chart} *Progress:* [ ${progressBar} ]\n\n`;

  if (totalPoints >= targetPoints) {
    const currentRedeemValue = totalPoints * (settings.redemptionRate || 80);
    message += `${EMOJI.party} *CONGRATULATIONS!* ${EMOJI.celebrate}\n`;
    message += `${EMOJI.gift} *Your ₹${currentRedeemValue.toLocaleString('en-IN')} Shopping Reward is UNLOCKED!*\n`;
    message += `You can redeem this discount directly on your next purchase! ${EMOJI.diamond}${EMOJI.sparkles}\n\n`;
  } else {
    const pointsWord = remainingPoints === 1 ? 'point' : 'points';
    message += `${EMOJI.gift} Collect all ${targetPoints} points to unlock an exclusive *₹${rewardValue} Shopping Reward!* ${EMOJI.ribbonHeart}\n`;
    message += `${EMOJI.target} *Only ${remainingPoints} more ${pointsWord}* to unlock your reward!\n\n`;
  }

  message += `Keep shopping, keep earning! ${EMOJI.bags}${EMOJI.sparkles}\n\n`;
  message += `With love,\n*${businessName}* ${EMOJI.tulip}`;

  return message;
}

/**
 * Formats a WhatsApp celebration greeting & special invitation offer message
 * sent directly to the customer (even without making any purchase).
 */
export function formatWhatsAppCelebrationWishMessage(params: {
  customerName: string;
  celebrationType: 'birthday' | 'anniversary' | 'combo';
  timing?: 'today' | 'tomorrow';
  businessName?: string;
}): string {
  const {
    customerName,
    celebrationType,
    timing = 'today',
    businessName = 'Zewar For U by Bhakti',
  } = params;

  const isTomorrow = timing === 'tomorrow';

  if (celebrationType === 'combo') {
    const greetingHeader = isTomorrow
      ? `${EMOJI.party} *Advance Happy Birthday & Anniversary, ${customerName}!* ${EMOJI.cake}${EMOJI.ring}`
      : `${EMOJI.party} *Double Celebration! Happy Birthday & Anniversary, ${customerName}!* ${EMOJI.celebrate}${EMOJI.cake}${EMOJI.ring}`;
    const validity = isTomorrow ? 'valid today and tomorrow' : 'valid today';

    return (
      `${greetingHeader}\n\n` +
      `Warmest wishes on your incredible milestone from *${businessName}*! ${EMOJI.hearts}\n\n` +
      `${EMOJI.gift} *YOUR EXCLUSIVE BUMPER GIFT*\n` +
      `Enjoy a flat *₹250 OFF* on your shopping purchase of ₹1,000 or more ${validity}! ${EMOJI.diamond}${EMOJI.sparkles}\n\n` +
      `Visit our store to celebrate and treat yourself! ${EMOJI.bags}${EMOJI.tulip}\n\n` +
      `With love,\n*${businessName}* ${EMOJI.tulip}`
    );
  }

  if (celebrationType === 'birthday') {
    const greetingHeader = isTomorrow
      ? `${EMOJI.cake} *Advance Birthday Wishes, ${customerName}!* ${EMOJI.party}`
      : `${EMOJI.cake} *Happy Birthday, ${customerName}!* ${EMOJI.party}`;
    const validity = isTomorrow ? 'valid today and tomorrow' : 'valid today';

    return (
      `${greetingHeader}\n\n` +
      `Warmest wishes on your special day from *${businessName}*! ${EMOJI.hearts}\n\n` +
      `${EMOJI.gift} *YOUR EXCLUSIVE BIRTHDAY GIFT*\n` +
      `Enjoy an exclusive flat *₹100 OFF* on your shopping purchase of ₹800 or more ${validity}! ${EMOJI.sparkles}\n\n` +
      `Visit our store and celebrate your special day in style. ${EMOJI.bags}${EMOJI.tulip}\n\n` +
      `With love,\n*${businessName}* ${EMOJI.tulip}`
    );
  }

  // Anniversary
  const greetingHeader = isTomorrow
    ? `${EMOJI.ring} *Advance Anniversary Wishes, ${customerName}!* ${EMOJI.hearts}`
    : `${EMOJI.ring} *Happy Anniversary, ${customerName}!* ${EMOJI.hearts}`;
  const validity = isTomorrow ? 'valid today and tomorrow' : 'valid today';

  return (
    `${greetingHeader}\n\n` +
    `Warmest congratulations on your milestone from *${businessName}*! ${EMOJI.sparkles}\n\n` +
    `${EMOJI.gift} *YOUR EXCLUSIVE ANNIVERSARY GIFT*\n` +
    `Enjoy an exclusive flat *₹100 OFF* on your shopping purchase of ₹800 or more ${validity}! ${EMOJI.bouquet}\n\n` +
    `Visit our store to celebrate your special milestone! ${EMOJI.bags}${EMOJI.tulip}\n\n` +
    `With love,\n*${businessName}* ${EMOJI.tulip}`
  );
}

/**
 * Opens WhatsApp directly with customer phone number and encoded message text.
 * Uses https://api.whatsapp.com/send to prevent URL emoji corruption that occurs with wa.me redirects.
 */
export function openWhatsAppChat(phone?: string, text: string = ''): void {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);

  if (!cleanPhone) {
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    return;
  }

  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodedText}`, '_blank');
}
