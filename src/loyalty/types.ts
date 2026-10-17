/**
 * Customer Reward Points & Loyalty System - Standalone Types
 */

export interface LoyaltySettings {
  /** Master toggle to turn reward points system ON/OFF */
  enabled: boolean;
  /** Amount in ₹ required to earn 1 reward point (Default: 500) */
  rupeesPerPoint: number;
  /** Value in ₹ for each redeemed point (Default: 80) */
  redemptionRate: number;
  /** Minimum points required before a customer can redeem (Default: 5) */
  minPointsToRedeem: number;
}

export interface LoyaltyCustomer {
  id: string;
  name: string;
  phone?: string;
  dob?: string;
  anniversary?: string;
  balance?: number; // Net khata balance
  loyaltyPoints: number; // Current accumulated points balance
  createdAt?: string;
  lastWhatsAppSentAt?: string; // Timestamp of last WhatsApp message sent
  lastWhatsAppSentType?: 'purchase' | 'celebration';
  lastWhatsAppTxId?: string; // ID of the transaction receipt sent
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: 'debit' | 'credit'; // 'debit' = You Gave / Purchase (earns points), 'credit' = You Got / Payment
  date: string;
  description?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  originalAmount?: number; // Pre-discount purchase amount
  celebrationDiscountApplied?: number; // Special offer discount (₹100 or ₹250)
  celebrationType?: 'birthday' | 'anniversary' | 'combo';
}

export interface LoyaltyManualAdjustment {
  id: string;
  customerId: string;
  pointsDelta: number; // positive = added, negative = deducted
  previousBalance: number;
  newBalance: number;
  reason: string;
  date: string;
}
