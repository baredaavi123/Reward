import { LoyaltyCustomer, LoyaltySettings, LoyaltyTransaction } from '../loyalty/types';
import { DEFAULT_LOYALTY_SETTINGS } from '../loyalty/loyaltyEngine';

const STORAGE_KEYS = {
  CUSTOMERS: 'reward_customers',
  TRANSACTIONS: 'reward_transactions',
  SETTINGS: 'reward_settings',
};

const INITIAL_CUSTOMERS: LoyaltyCustomer[] = [
  {
    id: 'cust-1',
    name: 'Ashok Garg',
    phone: '9876543210',
    dob: '1990-05-12',
    anniversary: '2018-11-20',
    balance: 500,
    loyaltyPoints: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Ramesh Garg',
    phone: '9812345678',
    dob: '1985-08-24',
    anniversary: '2012-02-14',
    balance: 2400,
    loyaltyPoints: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Suresh Kumar',
    phone: '9988776655',
    dob: '1996-03-15',
    balance: 0,
    loyaltyPoints: 0,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_TRANSACTIONS: LoyaltyTransaction[] = [
  {
    id: 'tx-1',
    customerId: 'cust-1',
    amount: 500,
    type: 'debit',
    date: new Date().toISOString(),
    description: 'Purchase / Dr. Entry',
    pointsEarned: 1,
    pointsRedeemed: 0,
  },
  {
    id: 'tx-2',
    customerId: 'cust-2',
    amount: 3000,
    type: 'debit',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    description: 'Shopping bill',
    pointsEarned: 6,
    pointsRedeemed: 0,
  },
];

export function loadStoredSettings(): LoyaltySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem('credit_point_settings');
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
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || localStorage.getItem('credit_point_customers');
    if (!raw) return INITIAL_CUSTOMERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

export function saveStoredCustomers(customers: LoyaltyCustomer[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
}

export function loadStoredTransactions(): LoyaltyTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || localStorage.getItem('credit_point_transactions');
    if (!raw) return INITIAL_TRANSACTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: LoyaltyTransaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}
