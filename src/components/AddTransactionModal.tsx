import React, { useState } from 'react';
import { X, Sparkles, Award, MessageSquare, Check, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LoyaltyCustomer } from '../loyalty/types';
import { calculatePointsEarned, formatWhatsAppLoyaltyMessage, openWhatsAppChat } from '../loyalty/loyaltyEngine';
import { RewardRedeemModal } from '../loyalty/components/RewardRedeemModal';
import { getCelebrationStatus } from '../utils/celebration';

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
  const { addTransaction, settings, markWhatsAppSent } = useApp();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pointsRedeemed, setPointsRedeemed] = useState<number>(0);
  const [discountApplied, setDiscountApplied] = useState<number>(0);
  const [applyCelebrationOffer, setApplyCelebrationOffer] = useState<boolean>(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const celebration = getCelebrationStatus(customer.dob, customer.anniversary);

  // Check celebration qualification
  const isEligibleForCelebration = celebration.isCelebrationActive && numAmount >= celebration.minPurchase;
  const celebrationDiscount = applyCelebrationOffer && isEligibleForCelebration ? celebration.discountAmount : 0;

  // Single Offer Rule: On celebration day, points redemption is not combined with celebration offer
  const activeDiscountApplied = celebration.isCelebrationActive ? 0 : discountApplied;
  const netPayable = Math.max(0, numAmount - activeDiscountApplied - celebrationDiscount);

  // Requirement 7: Calculate points earned on net payable
  const pointsEarned =
    settings.enabled && netPayable >= (settings.rupeesPerPoint || 500)
      ? calculatePointsEarned(netPayable, settings)
      : 0;

  const currentPoints = customer.loyaltyPoints || 0;
  const activePointsRedeemed = celebration.isCelebrationActive ? 0 : pointsRedeemed;
  const newPointsTotal = Math.max(0, currentPoints + pointsEarned - activePointsRedeemed);

  const cleanPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/^\+91\s*/, '').replace(/^91(?=\d{10})/, '');
  };

  const handleProcess = (shouldSendWhatsApp: boolean) => {
    if (numAmount <= 0) return;

    // 1. Add transaction in state/storage
    const newTx = addTransaction({
      customerId: customer.id,
      amount: numAmount,
      originalAmount: numAmount,
      type: 'debit',
      description:
        description.trim() ||
        (celebrationDiscount > 0
          ? `Purchase (${celebration.badgeLabel} -₹${celebrationDiscount})`
          : 'Purchase Bill'),
      pointsRedeemed: activePointsRedeemed,
      discountApplied: activeDiscountApplied,
      celebrationDiscountApplied: celebrationDiscount,
      celebrationType: celebrationDiscount > 0 ? celebration.celebrationType || undefined : undefined,
    });

    // 2. If 'Save and Send' clicked, open WhatsApp and mark locked
    if (shouldSendWhatsApp && customer.phone) {
      const message = formatWhatsAppLoyaltyMessage({
        customerName: customer.name,
        purchaseAmount: netPayable,
        originalAmount: numAmount,
        celebrationDiscountApplied: celebrationDiscount,
        celebrationType: celebrationDiscount > 0 ? celebration.celebrationType || undefined : undefined,
        pointsEarned,
        oldPoints: currentPoints,
        totalPoints: newPointsTotal,
        settings,
        businessName: 'Zewar For U by Bhakti',
      });

      openWhatsAppChat(customer.phone, message);
      markWhatsAppSent(customer.id, 'purchase', newTx.id);
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

            {/* Special Celebration Offer Card (2-Day Window) */}
            {celebration.isCelebrationActive && (
              <div className="rounded-xl border border-pink-200 overflow-hidden bg-pink-50/70 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-pink-950">
                  <span className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-pink-600" />
                    {celebration.offerTitle}
                  </span>
                  <span className="text-[10px] bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full uppercase font-black tracking-wide">
                    {celebration.badgeLabel}
                  </span>
                </div>

                {isEligibleForCelebration ? (
                  <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-pink-200 cursor-pointer shadow-2xs hover:bg-pink-50/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={applyCelebrationOffer}
                      onChange={(e) => setApplyCelebrationOffer(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        Apply Special Deduction: -₹{celebration.discountAmount}
                      </span>
                      <span className="text-[11px] text-pink-700 font-medium">
                        Min. purchase threshold (₹{celebration.minPurchase}) reached!
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className="text-[11px] text-pink-800 bg-white/70 p-2 rounded-lg border border-pink-100 flex items-center justify-between">
                    <span>Flat <strong>₹{celebration.discountAmount} OFF</strong> on ₹{celebration.minPurchase}+</span>
                    <span className="font-bold text-pink-900">
                      Add ₹{(celebration.minPurchase - numAmount).toFixed(0)} more to qualify
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Loyalty points preview on Purchase Bill */}
            {settings.enabled && (
              <div className="space-y-2">
                <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-2.5 text-xs flex items-center justify-between text-amber-900">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Points to Earn:
                  </span>
                  <span className="font-extrabold text-amber-950">
                    {netPayable < (settings.rupeesPerPoint || 500) && netPayable > 0 ? (
                      <span className="text-[11px] text-gray-500 font-semibold">
                        0 Pts (Min ₹{settings.rupeesPerPoint || 500} net required)
                      </span>
                    ) : (
                      `+${pointsEarned} Point${pointsEarned === 1 ? '' : 's'}`
                    )}
                  </span>
                </div>

                {/* Redeem points option (Only available on non-celebration days, per single offer rule) */}
                {!celebration.isCelebrationActive && customer.loyaltyPoints >= (settings.minPointsToRedeem || 5) && (
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

            {/* Net Amount Breakdown if any discount is active */}
            {(celebrationDiscount > 0 || activeDiscountApplied > 0) && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Gross Purchase Amount:</span>
                  <span className="font-semibold">₹{numAmount.toFixed(2)}</span>
                </div>
                {celebrationDiscount > 0 && (
                  <div className="flex justify-between text-pink-700 font-bold">
                    <span>{celebration.badgeLabel} Offer:</span>
                    <span>-₹{celebrationDiscount.toFixed(2)}</span>
                  </div>
                )}
                {activeDiscountApplied > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Reward Points Discount:</span>
                    <span>-₹{activeDiscountApplied.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-950 font-extrabold text-sm border-t border-gray-200 pt-1.5">
                  <span>Net Amount to Pay:</span>
                  <span className="text-emerald-700">₹{netPayable.toFixed(2)}</span>
                </div>
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
