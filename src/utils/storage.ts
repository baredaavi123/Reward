import { LoyaltyCustomer, LoyaltySettings, LoyaltyTransaction } from '../loyalty/types';
import { DEFAULT_LOYALTY_SETTINGS } from '../loyalty/loyaltyEngine';

const STORAGE_KEYS = {
  CUSTOMERS: 'reward_customers',
  TRANSACTIONS: 'reward_transactions',
  SETTINGS: 'reward_settings',
};

export function loadStoredSettings(): LoyaltySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_LOYALTY_SETTINGS;
    return { ...DEFAULT_LOYALTY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LOYALTY_SETTINGS;
  }
}

export function saveStoredSettings(settings: LoyaltySettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadStoredCustomers(): LoyaltyCustomer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Purge old mock data if present in user storage
    const cleaned = parsed.filter(
      (c: LoyaltyCustomer) => c.id !== 'cust-1' && c.id !== 'cust-2' && c.id !== 'cust-3'
    );
    if (cleaned.length !== parsed.length) {
      saveStoredCustomers(cleaned);
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredCustomers(customers: LoyaltyCustomer[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
}

export function loadStoredTransactions(): LoyaltyTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Purge old mock data if present in user storage
    const cleaned = parsed.filter(
      (t: LoyaltyTransaction) =>
        t.id !== 'tx-1' && t.id !== 'tx-2' && t.customerId !== 'cust-1' && t.customerId !== 'cust-2'
    );
    if (cleaned.length !== parsed.length) {
      saveStoredTransactions(cleaned);
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredTransactions(transactions: LoyaltyTransaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function clearAllStorageData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem('credit_point_customers');
    localStorage.removeItem('credit_point_transactions');
  } catch {
    // Ignore storage errors
  }
}
