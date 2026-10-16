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
    oldPoints = 0,
    totalPoints,
    settings = DEFAULT_LOYALTY_SETTINGS,
    businessName = 'Zewar For You',
  } = params;

  const redemptionValue = totalPoints * (settings.redemptionRate || 80);
  const formattedAmount = purchaseAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const pointsLabel = pointsEarned === 1 ? '1 REWARD POINT' : `${pointsEarned} REWARD POINTS`;

  let message = `Namaste ${customerName},\n\n`;

  if (pointsEarned > 0) {
    message += `🎉 *YOU GOT ${pointsLabel}* against your purchase of ₹${formattedAmount} at *${businessName}*!\n\n`;
    message += `⭐ *Total Points Balance:* ${totalPoints} Point (${oldPoints} + ${pointsEarned})\n`;
  } else {
    message += `Thank you for your purchase of ₹${formattedAmount} at *${businessName}*!\n\n`;
    message += `⭐ *Total Points Balance:* ${totalPoints} Point\n`;
  }

  message +=
    `💰 *Redeemable Value:* ₹${redemptionValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })} (Discount on next purchase)\n\n` +
    `Thank you for shopping with us! 🙏`;

  return message;
}

/**
 * Opens WhatsApp directly with customer phone number and encoded message text.
 */
export function openWhatsAppChat(phone?: string, text: string = ''): void {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);

  if (!cleanPhone) {
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    return;
  }

  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  window.open(`https://wa.me/${phoneWithCountry}?text=${encodedText}`, '_blank');
}
