import React from 'react';
import { useApp } from '../context/AppContext';
import { RewardSettingsCard } from '../loyalty/components/RewardSettingsCard';
import { BookOpen, ArrowLeft } from 'lucide-react';

interface SettingsViewProps {
  onBackToCustomers?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBackToCustomers }) => {
  const { settings, updateSettings } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header: Left arrow key before 'Settings' (Req 3) and rename 'Settings' (Req 2) */}
      <div className="flex items-center gap-3">
        {onBackToCustomers && (
          <button
            onClick={onBackToCustomers}
            className="p-2 -ml-1 text-gray-700 hover:text-gray-900 hover:bg-gray-200/80 rounded-xl transition-all active:scale-95 flex items-center justify-center bg-white border border-gray-200 shadow-2xs"
            title="Back to Customers"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Settings</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure rules, redemption values, and reward rates for your customers.
          </p>
        </div>
      </div>

      {/* Main Reward Settings Card */}
      <RewardSettingsCard settings={settings} onChange={updateSettings} />

      {/* How it works note */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-600" />
          How the Reward System Works
        </h3>
        <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
          <p>
            1. <strong>Automatic Point Accumulation:</strong> Every time a customer makes a purchase or a Debit entry is recorded, points are calculated using the configured threshold (e.g. ₹{settings.rupeesPerPoint || 500} = 1 Point).
          </p>
          <p>
            2. <strong>Redemption on Bills:</strong> When creating a bill or transaction, if the customer has at least {settings.minPointsToRedeem || 5} points, the points can be redeemed to give a direct cash discount (e.g. ₹{settings.redemptionRate || 80} per point).
          </p>
          <p>
            3. <strong>WhatsApp Integration:</strong> From the customer profile, clicking <em>"Send Message (WhatsApp)"</em> pre-fills a formatted reward message directly to the customer's phone number.
          </p>
          <p>
            4. <strong>Reversal on Delete:</strong> Deleting a transaction automatically restores the exact points balance.
          </p>
        </div>
      </div>

      {/* Powered by VYOMWEB & Version */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 text-center shadow-xs">
        <p className="text-xs font-semibold text-gray-700 tracking-wide flex items-center justify-center flex-wrap gap-x-2 gap-y-1">
          <span>
            Powered by <span className="text-amber-600 font-bold">VYOMWEB</span>,{' '}
            <a
              href="tel:9826299324"
              className="hover:text-amber-600 hover:underline transition-colors font-medium text-gray-800"
            >
              9826299324
            </a>
          </span>
          <span className="text-gray-300 hidden sm:inline">•</span>
          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            Version 1.0.1
          </span>
        </p>
      </div>
    </div>
  );
};
