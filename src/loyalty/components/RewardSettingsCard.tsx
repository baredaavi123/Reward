import React from 'react';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { LoyaltySettings } from '../types';

interface RewardSettingsCardProps {
  settings: LoyaltySettings;
  onChange: (updated: LoyaltySettings) => void;
}

export const RewardSettingsCard: React.FC<RewardSettingsCardProps> = ({
  settings,
  onChange,
}) => {
  const handleChange = (field: keyof LoyaltySettings, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const previewAmount = 1000;
  const previewPoints = settings.rupeesPerPoint > 0 ? Math.floor(previewAmount / settings.rupeesPerPoint) : 0;
  const previewMinRedeem = settings.minPointsToRedeem || 5;
  const previewDiscount = previewMinRedeem * (settings.redemptionRate || 80);

  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-transparent border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-amber-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
              Customer Reward & Loyalty System
              {settings.enabled ? (
                <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Disabled
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Award reward points to customers on purchases and allow point redemptions on bills.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
        </label>
      </div>

      {/* Settings Form Body */}
      {settings.enabled ? (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rupees per Point */}
            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/80">
              <label className="block text-xs font-semibold text-amber-950 uppercase tracking-wider mb-1">
                Earning Rate (₹ Spend / 1 Point)
              </label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={settings.rupeesPerPoint ?? 500}
                  onChange={(e) => handleChange('rupeesPerPoint', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-amber-200 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="500"
                />
              </div>
              <p className="text-[11px] text-amber-800/80 mt-1.5">
                Every ₹{settings.rupeesPerPoint || 500} purchase awards 1 reward point.
              </p>
            </div>

            {/* Redemption Rate */}
            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/80">
              <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                Redemption Value (₹ / 1 Point)
              </label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={settings.redemptionRate ?? 80}
                  onChange={(e) => handleChange('redemptionRate', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="80"
                />
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-1.5">
                Each redeemed point deducts ₹{settings.redemptionRate || 80} discount from bill.
              </p>
            </div>

            {/* Minimum Points to Redeem */}
            <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/80">
              <label className="block text-xs font-semibold text-indigo-950 uppercase tracking-wider mb-1">
                Minimum Points to Redeem
              </label>
              <div className="relative mt-2">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={settings.minPointsToRedeem ?? 5}
                  onChange={(e) => handleChange('minPointsToRedeem', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
              <p className="text-[11px] text-indigo-800/80 mt-1.5">
                Customers must have at least {settings.minPointsToRedeem || 5} points to redeem.
              </p>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold text-amber-950">Current Rule Summary:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>
                  Customer spending <strong>₹1,000</strong> earns <strong>{previewPoints} Points</strong>.
                </li>
                <li>
                  Customer redeeming <strong>{previewMinRedeem} Points</strong> gets a <strong>₹{previewDiscount.toFixed(2)}</strong> discount.
                </li>
                <li>
                  Redemptions below <strong>{previewMinRedeem} Points</strong> are prevented.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-gray-500 bg-gray-50/50">
          Loyalty system is disabled. Turn the toggle ON to enable customer points and rewards.
        </div>
      )}
    </div>
  );
};

// Backwards-compatible alias
export const CreditPointSettingsCard = RewardSettingsCard;
export type CreditPointSettingsCardProps = RewardSettingsCardProps;
