import React, { useState } from 'react';
import { Phone, Edit3, Plus, ArrowLeft, Star, Gift, History, Calendar, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomerLoyaltyCard } from '../loyalty/components/CustomerLoyaltyCard';
import { ManualPointsAdjustModal } from '../loyalty/components/ManualPointsAdjustModal';
import { AddTransactionModal } from './AddTransactionModal';
import { EditCustomerModal } from './EditCustomerModal';

export const CustomerDetail: React.FC = () => {
  const {
    customers,
    transactions,
    selectedCustomerId,
    setSelectedCustomerId,
    adjustCustomerPoints,
    settings,
  } = useApp();

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);

  const customer = customers.find((c) => c.id === selectedCustomerId);

  if (!customer) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-400 h-[calc(100vh-5.5rem)] flex flex-col items-center justify-center">
        <p className="text-sm">Select a customer from the list to view their ledger & reward points.</p>
      </div>
    );
  }

  const customerTx = transactions.filter((t) => t.customerId === customer.id);
  const balance = customer.balance || 0;

  // Clean phone without +91
  const cleanPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/^\+91\s*/, '').replace(/^91(?=\d{10})/, '');
  };

  // Format date display
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Check if date matches today's month and day (Requirement 3: Pink color box)
  const isTodayDate = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return parseInt(parts[1], 10) === currentMonth && parseInt(parts[2], 10) === currentDay;
      }
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return parseInt(parts[1], 10) === currentMonth && parseInt(parts[0], 10) === currentDay;
      }
    }
    return false;
  };

  // Points Gain & Use audit metrics
  const totalPointsGained = customerTx.reduce((sum, tx) => sum + (tx.pointsEarned || 0), 0);
  const totalPointsUsed = customerTx.reduce((sum, tx) => sum + (tx.pointsRedeemed || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col h-[calc(100vh-5.5rem)] overflow-hidden">
      {/* Customer Header */}
      <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedCustomerId(null)}
            className="md:hidden p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-gray-900 text-base leading-tight">{customer.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {customer.phone && (
                <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {cleanPhone(customer.phone)}
                </span>
              )}
              {customer.dob && (
                <span
                  className={`text-[11px] flex items-center gap-1 ${
                    isTodayDate(customer.dob)
                      ? 'bg-pink-100 text-pink-800 font-bold border border-pink-300 px-2 py-0.5 rounded-md shadow-2xs'
                      : 'text-gray-500'
                  }`}
                >
                  <Calendar className={`w-3 h-3 ${isTodayDate(customer.dob) ? 'text-pink-600' : 'text-gray-400'}`} />
                  DOB: {formatDateDisplay(customer.dob)}
                </span>
              )}
              {customer.anniversary && (
                <span
                  className={`text-[11px] flex items-center gap-1 ${
                    isTodayDate(customer.anniversary)
                      ? 'bg-pink-100 text-pink-800 font-bold border border-pink-300 px-2 py-0.5 rounded-md shadow-2xs'
                      : 'text-gray-500'
                  }`}
                >
                  Anniv: {formatDateDisplay(customer.anniversary)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Button: icon only, removed 'Edit' text (Req 3) */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all active:scale-95 flex items-center justify-center"
            title="Edit customer details & delete option"
          >
            <Edit3 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* Customer Loyalty Points Card: Add Bill shifted near Send WhatsApp (Req 6) */}
        {settings.enabled && (
          <CustomerLoyaltyCard
            customer={customer}
            settings={settings}
            businessName="Zewar For U by Bhakti"
            onOpenAdjustModal={() => setIsAdjustModalOpen(true)}
            onAddBillClick={() => setIsAddBillOpen(true)}
          />
        )}

        {/* Points Summary Audit Box (Requirement 3 & 5: Record & show all points gain and use) */}
        <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-3">
          <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-600 fill-amber-500" /> Points Balance & Lifetime Summary
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg p-2 border border-amber-100 shadow-2xs">
              <span className="text-[10px] text-gray-500 font-medium block">Total Gained</span>
              <span className="text-sm font-extrabold text-emerald-600">+{totalPointsGained} Pts</span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-amber-100 shadow-2xs">
              <span className="text-[10px] text-gray-500 font-medium block">Total Used</span>
              <span className="text-sm font-extrabold text-rose-600">-{totalPointsUsed} Pts</span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-amber-100 shadow-2xs">
              <span className="text-[10px] text-gray-500 font-medium block">Available</span>
              <span className="text-sm font-black text-amber-700">{customer.loyaltyPoints || 0} Pts</span>
            </div>
          </div>
        </div>

        {/* Transactions & Points Ledger History */}
        <div>
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Transaction & Reward History
          </h3>

          {customerTx.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              No bills recorded yet. Click <strong>Add Bill</strong> below to record a purchase.
            </div>
          ) : (
            <div className="space-y-2">
              {customerTx.map((tx) => {
                const isDebit = tx.type === 'debit';
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-white hover:border-gray-200 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {/* Requirement 2: Keep only first word (Payment / Bill) and remove duplicate word */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isDebit
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isDebit ? 'Bill' : 'Payment'}
                        </span>
                        {Boolean(
                          tx.description &&
                          tx.description !== 'Purchase Bill' &&
                          tx.description !== 'Payment Received' &&
                          tx.description !== 'Payment' &&
                          tx.description !== 'Bill'
                        ) && (
                          <p className="text-xs font-semibold text-gray-800">{tx.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {/* Points Gained */}
                        {Boolean(tx.pointsEarned && tx.pointsEarned > 0) && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <Star className="w-2.5 h-2.5 fill-emerald-400 text-emerald-500" />
                            +{tx.pointsEarned} Pts Gained
                          </span>
                        )}

                        {/* Points Used / Redeemed */}
                        {Boolean(tx.pointsRedeemed && tx.pointsRedeemed > 0) && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            <Gift className="w-2.5 h-2.5 text-rose-600" />
                            -{tx.pointsRedeemed} Pts Used
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-gray-900 block">
                        ₹{tx.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAddBillOpen && (
        <AddTransactionModal
          isOpen={true}
          onClose={() => setIsAddBillOpen(false)}
          customer={customer}
        />
      )}

      {isEditModalOpen && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customer={customer}
        />
      )}

      <ManualPointsAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        customer={customer}
        onAdjustPoints={adjustCustomerPoints}
      />
    </div>
  );
};
