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
  clearAllStorageData,
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
    originalAmount?: number;
    type: 'debit' | 'credit';
    description?: string;
    pointsRedeemed?: number;
    discountApplied?: number;
    celebrationDiscountApplied?: number;
    celebrationType?: 'birthday' | 'anniversary' | 'combo';
  }) => LoyaltyTransaction;
  deleteTransaction: (id: string) => void;
  adjustCustomerPoints: (customerId: string, newPoints: number, reason: string) => void;
  updateSettings: (newSettings: LoyaltySettings) => void;
  clearAllData: () => void;
  markWhatsAppSent: (customerId: string, type: 'purchase' | 'celebration', txId?: string) => void;
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
    originalAmount?: number;
    type: 'debit' | 'credit';
    description?: string;
    pointsRedeemed?: number;
    discountApplied?: number;
    celebrationDiscountApplied?: number;
    celebrationType?: 'birthday' | 'anniversary' | 'combo';
  }): LoyaltyTransaction => {
    const {
      customerId,
      amount,
      originalAmount,
      type,
      description,
      pointsRedeemed = 0,
      discountApplied = 0,
      celebrationDiscountApplied = 0,
      celebrationType,
    } = params;

    // Net financial debit after any loyalty points discount & celebration discount
    const totalDiscount = discountApplied + celebrationDiscountApplied;
    const netAmount = type === 'debit' ? Math.max(0, amount - totalDiscount) : amount;

    // Calculate points earned on debit purchase based on net paid amount
    const pointsEarned =
      type === 'debit' && settings.enabled ? calculatePointsEarned(netAmount, settings) : 0;

    const newTx: LoyaltyTransaction = {
      id: `tx-${Date.now()}`,
      customerId,
      amount: netAmount,
      originalAmount: originalAmount || amount,
      type,
      date: new Date().toISOString(),
      description: description?.trim() || (type === 'debit' ? 'You Gave / Purchase' : 'You Got / Payment'),
      pointsEarned,
      pointsRedeemed,
      celebrationDiscountApplied,
      celebrationType,
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

    return newTx;
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

  const clearAllData = () => {
    setCustomers([]);
    setTransactions([]);
    setSelectedCustomerId(null);
    clearAllStorageData();
  };

  const markWhatsAppSent = (
    customerId: string,
    type: 'purchase' | 'celebration',
    txId?: string
  ) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              lastWhatsAppSentAt: new Date().toISOString(),
              lastWhatsAppSentType: type,
              lastWhatsAppTxId: txId || c.lastWhatsAppTxId,
            }
          : c
      )
    );
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
        clearAllData,
        markWhatsAppSent,
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
