import React, { useState } from 'react';
import { X, Sparkles, Award, MessageSquare, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LoyaltyCustomer } from '../loyalty/types';
import { calculatePointsEarned, formatWhatsAppLoyaltyMessage, openWhatsAppChat } from '../loyalty/loyaltyEngine';
import { RewardRedeemModal } from '../loyalty/components/RewardRedeemModal';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: LoyaltyCustomer;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const { addTransaction, settings } = useApp();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pointsRedeemed, setPointsRedeemed] = useState<number>(0);
  const [discountApplied, setDiscountApplied] = useState<number>(0);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  // Requirement 7: Do not increase points whenever amount is less than 500 rupees
  const pointsEarned =
    settings.enabled && numAmount >= (settings.rupeesPerPoint || 500)
      ? calculatePointsEarned(numAmount, settings)
      : 0;

  const netPayable = Math.max(0, numAmount - discountApplied);
  const currentPoints = customer.loyaltyPoints || 0;
  const newPointsTotal = Math.max(0, currentPoints + pointsEarned - pointsRedeemed);

  const cleanPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/^\+91\s*/, '').replace(/^91(?=\d{10})/, '');
  };

  const handleProcess = (shouldSendWhatsApp: boolean) => {
    if (numAmount <= 0) return;

    // 1. Add transaction in state/storage
    addTransaction({
      customerId: customer.id,
      amount: numAmount,
      type: 'debit',
      description: description.trim() || 'Purchase Bill',
      pointsRedeemed,
      discountApplied,
    });

    // 2. If 'Save and Send' clicked, open WhatsApp
    if (shouldSendWhatsApp && customer.phone) {
      const message = formatWhatsAppLoyaltyMessage({
        customerName: customer.name,
        purchaseAmount: numAmount,
        pointsEarned,
        oldPoints: currentPoints,
        totalPoints: newPointsTotal,
        settings,
        businessName: 'Zewar For U by Bhakti',
      });

      openWhatsAppChat(customer.phone, message);
    }

    onClose();
  };

  const handleApplyRedemption = (pts: number, disc: number) => {
    setPointsRedeemed(pts);
    setDiscountApplied(disc);
  };

  const clearRedemption = () => {
    setPointsRedeemed(0);
    setDiscountApplied(0);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Add Bill
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {customer.name} {customer.phone && `(${cleanPhone(customer.phone)})`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcess(false);
            }}
            className="mt-4 space-y-4"
          >
            {/* Bill Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Enter Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-base">₹</span>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-xl text-lg font-black text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Loyalty points preview on Purchase Bill */}
            {settings.enabled && (
              <div className="space-y-2">
                <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-2.5 text-xs flex items-center justify-between text-amber-900">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Points to Earn:
                  </span>
                  <span className="font-extrabold text-amber-950">
                    {numAmount < (settings.rupeesPerPoint || 500) && numAmount > 0 ? (
                      <span className="text-[11px] text-gray-500 font-semibold">
                        0 Pts (Min ₹{settings.rupeesPerPoint || 500} required)
                      </span>
                    ) : (
                      `+${pointsEarned} Point${pointsEarned === 1 ? '' : 's'}`
                    )}
                  </span>
                </div>

                {/* Redeem points option if customer has enough points */}
                {customer.loyaltyPoints >= (settings.minPointsToRedeem || 5) && (
                  <div className="pt-1">
                    {pointsRedeemed > 0 ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-emerald-950 block">
                            🎁 Redeemed {pointsRedeemed} Pts
                          </span>
                          <span className="text-[11px] text-emerald-800">
                            Discount: -₹{discountApplied.toFixed(2)} | Net: ₹{netPayable.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={clearRedemption}
                          className="text-[11px] text-rose-600 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsRedeemModalOpen(true)}
                        className="w-full py-1.5 px-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Use / Redeem Points (Avail: {customer.loyaltyPoints} Pts)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Gold jewelry purchase, Silver item..."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Requirement 6: Two buttons: 'Save' and 'Save and Send' */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Save Button (No WhatsApp) */}
                <button
                  type="button"
                  disabled={numAmount <= 0}
                  onClick={() => handleProcess(false)}
                  className="py-2.5 px-3 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-98 rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 text-gray-600" />
                  Save
                </button>

                {/* Save and Send Button (With WhatsApp) */}
                <button
                  type="button"
                  disabled={numAmount <= 0}
                  onClick={() => handleProcess(true)}
                  className="py-2.5 px-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  Save and Send
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-1.5 text-center text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Points Redemption Modal */}
      <RewardRedeemModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        availablePoints={customer.loyaltyPoints || 0}
        settings={settings}
        onConfirmRedeem={handleApplyRedemption}
      />
    </>
  );
};
