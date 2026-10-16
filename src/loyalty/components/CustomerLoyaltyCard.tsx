import React from 'react';
import { Award, MessageSquare, Sliders, Plus } from 'lucide-react';
import { LoyaltyCustomer, LoyaltySettings } from '../types';
import { formatWhatsAppLoyaltyMessage, openWhatsAppChat } from '../loyaltyEngine';

interface CustomerLoyaltyCardProps {
  customer: LoyaltyCustomer;
  settings: LoyaltySettings;
  businessName?: string;
  onOpenAdjustModal?: () => void;
  onAddBillClick?: () => void;
}

export const CustomerLoyaltyCard: React.FC<CustomerLoyaltyCardProps> = ({
  customer,
  settings,
  businessName = 'Zewar For You',
  onOpenAdjustModal,
  onAddBillClick,
}) => {
  if (!settings.enabled) return null;

  const points = customer.loyaltyPoints || 0;
  const rate = settings.redemptionRate || 80;
  const cashValue = points * rate;

  const handleSendWhatsApp = () => {
    const message = formatWhatsAppLoyaltyMessage({
      customerName: customer.name,
      totalPoints: points,
      settings,
      businessName,
    });
    openWhatsAppChat(customer.phone, message);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-2xl p-4.5 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute right-4 bottom-2 text-white/10 pointer-events-none">
        <Award className="w-36 h-36 -mr-6 -mb-6" />
      </div>

      <div className="relative z-10">
        {/* Top Section: '<points> Points' on left, 'Approx. Value' on right side (Req 1) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg shrink-0">
              <Award className="w-4 h-4 text-amber-100" />
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs shrink-0">
              {points} Point{points === 1 ? '' : 's'}
            </span>
          </div>

          <p className="text-xs text-amber-100 font-medium text-right bg-white/10 px-2.5 py-1 rounded-xl backdrop-blur-xs">
            Approx. Value: <strong className="text-white text-xs font-bold">₹{cashValue.toFixed(2)}</strong> <span className="text-[11px] text-amber-200">(₹{rate}/point)</span>
          </p>
        </div>

        {/* Action Buttons: Add Bill shifted near Send WhatsApp (Req 6) */}
        <div className="flex items-center gap-2">
          {/* Add Bill Button */}
          {onAddBillClick && (
            <button
              type="button"
              onClick={onAddBillClick}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-amber-50 active:scale-[0.98] text-amber-950 text-xs font-black py-2.5 px-3 rounded-xl shadow-md shadow-black/10 transition-all"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              Add Bill
            </button>
          )}

          {/* Send WhatsApp Button (renamed from Send Message (WhatsApp)) */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-md shadow-emerald-950/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Send WhatsApp
          </button>

          {/* Adjust Points Button */}
          {onOpenAdjustModal && (
            <button
              type="button"
              onClick={onOpenAdjustModal}
              title="Manually adjust points"
              className="p-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl backdrop-blur-sm transition-all"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
