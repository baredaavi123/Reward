import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoyaltyCustomer, LoyaltySettings, LoyaltyTransaction } from '../loyalty/types';
import { calculatePointsEarned, DEFAULT_LOYALTY_SETTINGS } from '../loyalty/loyaltyEngine';
import {
  loadStoredCustomers,
  loadStoredSettings,
  loadStoredTransactions,
  saveStoredCustomers,
  saveStoredSettings,
  saveStoredTransactions,
} from '../utils/storage';

interface AppContextType {
  customers: LoyaltyCustomer[];
  transactions: LoyaltyTransaction[];
  settings: LoyaltySettings;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  addCustomer: (name: string, phone?: string, dob?: string, anniversary?: string) => LoyaltyCustomer;
  updateCustomer: (id: string, updates: Partial<LoyaltyCustomer>) => void;
  deleteCustomer: (id: string) => void;
  addTransaction: (params: {
    customerId: string;
    amount: number;
    type: 'debit' | 'credit';
    description?: string;
    pointsRedeemed?: number;
    discountApplied?: number;
  }) => void;
  deleteTransaction: (id: string) => void;
  adjustCustomerPoints: (customerId: string, newPoints: number, reason: string) => void;
  updateSettings: (newSettings: LoyaltySettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>(loadStoredCustomers);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>(loadStoredTransactions);
  const [settings, setSettings] = useState<LoyaltySettings>(loadStoredSettings);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    saveStoredCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  const addCustomer = (name: string, phone?: string, dob?: string, anniversary?: string): LoyaltyCustomer => {
    const newCust: LoyaltyCustomer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone?.trim(),
      dob: dob?.trim(),
      anniversary: anniversary?.trim(),
      balance: 0,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<LoyaltyCustomer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setTransactions((prev) => prev.filter((t) => t.customerId !== id));
    if (selectedCustomerId === id) setSelectedCustomerId(null);
  };

  const addTransaction = (params: {
    customerId: string;
    amount: number;
    type: 'debit' | 'credit';
    description?: string;
    pointsRedeemed?: number;
    discountApplied?: number;
  }) => {
    const { customerId, amount, type, description, pointsRedeemed = 0, discountApplied = 0 } = params;

    // Calculate points earned on debit purchase
    const pointsEarned =
      type === 'debit' && settings.enabled ? calculatePointsEarned(amount, settings) : 0;

    // Net financial debit after any loyalty points discount
    const netAmount = type === 'debit' ? Math.max(0, amount - discountApplied) : amount;

    const newTx: LoyaltyTransaction = {
      id: `tx-${Date.now()}`,
      customerId,
      amount: netAmount,
      type,
      date: new Date().toISOString(),
      description: description?.trim() || (type === 'debit' ? 'You Gave / Purchase' : 'You Got / Payment'),
      pointsEarned,
      pointsRedeemed,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update customer points and balance
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;

        const currentPoints = c.loyaltyPoints || 0;
        const netPoints = Math.max(0, currentPoints + pointsEarned - pointsRedeemed);

        const currentBalance = c.balance || 0;
        const newBalance = type === 'debit' ? currentBalance + netAmount : currentBalance - netAmount;

        return {
          ...c,
          loyaltyPoints: netPoints,
          balance: newBalance,
        };
      })
    );
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse points and balance
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== tx.customerId) return c;

        const pointsEarned = tx.pointsEarned || 0;
        const pointsRedeemed = tx.pointsRedeemed || 0;
        const currentPoints = c.loyaltyPoints || 0;
        const revertedPoints = Math.max(0, currentPoints - pointsEarned + pointsRedeemed);

        const currentBalance = c.balance || 0;
        const revertedBalance =
          tx.type === 'debit' ? currentBalance - tx.amount : currentBalance + tx.amount;

        return {
          ...c,
          loyaltyPoints: revertedPoints,
          balance: revertedBalance,
        };
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const adjustCustomerPoints = (customerId: string, newPoints: number, reason: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, loyaltyPoints: newPoints } : c))
    );

    // Record an audit transaction entry
    const auditTx: LoyaltyTransaction = {
      id: `tx-adj-${Date.now()}`,
      customerId,
      amount: 0,
      type: 'debit',
      date: new Date().toISOString(),
      description: `⭐ Points Adjustment: ${reason}`,
      pointsEarned: 0,
      pointsRedeemed: 0,
    };
    setTransactions((prev) => [auditTx, ...prev]);
  };

  const updateSettings = (newSettings: LoyaltySettings) => {
    setSettings(newSettings);
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        transactions,
        settings,
        selectedCustomerId,
        setSelectedCustomerId,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addTransaction,
        deleteTransaction,
        adjustCustomerPoints,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
