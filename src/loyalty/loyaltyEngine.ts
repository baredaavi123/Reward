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
};

/**
 * Formats a ready-to-send WhatsApp notification message for the customer.
 */
export function formatWhatsAppLoyaltyMessage(params: {
  customerName: string;
  pointsEarned?: number;
  purchaseAmount?: number;
  oldPoints?: number;
  totalPoints: number;
  settings?: LoyaltySettings;
  businessName?: string;
}): string {
  const {
    customerName,
    pointsEarned = 0,
    purchaseAmount = 0,
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
    const formattedAmount = purchaseAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    message += `${EMOJI.bags} *Purchase Amount:* ₹${formattedAmount}\n`;
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
