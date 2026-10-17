import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RewardSettingsCard } from '../loyalty/components/RewardSettingsCard';
import { BookOpen, ArrowLeft, Trash2, Lock, KeyRound, Check } from 'lucide-react';

interface SettingsViewProps {
  onBackToCustomers?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBackToCustomers }) => {
  const { settings, updateSettings, clearAllData, pin, updatePin } = useApp();

  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (currentPinInput !== pin) {
      setPinError('Current PIN is incorrect.');
      return;
    }
    if (newPinInput.length !== 4) {
      setPinError('New PIN must be exactly 4 digits.');
      return;
    }
    if (!/^\d{4}$/.test(newPinInput)) {
      setPinError('New PIN must contain numbers only.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinError('New PIN and Confirm PIN do not match.');
      return;
    }

    updatePin(newPinInput);
    setIsChangingPin(false);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinSuccess('Security PIN has been updated successfully!');
    setTimeout(() => setPinSuccess(''), 4000);
  };

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

      {/* Security PIN Settings */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                Security PIN Protection
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Set a 4-digit PIN to secure your Reward app on startup.
              </p>
            </div>
          </div>
          {!isChangingPin && (
            <button
              onClick={() => {
                setIsChangingPin(true);
                setPinError('');
                setPinSuccess('');
                setCurrentPinInput('');
                setNewPinInput('');
                setConfirmPinInput('');
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Change PIN
            </button>
          )}
        </div>

        {pinSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pinSuccess}</span>
          </div>
        )}

        {isChangingPin && (
          <form
            onSubmit={handleChangePinSubmit}
            className="pt-3 border-t border-gray-100 space-y-3.5 animate-fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Current PIN"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-widest text-center"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="New PIN"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-widest text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Confirm PIN"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-widest text-center"
                />
              </div>
            </div>

            {pinError && (
              <p className="text-xs font-semibold text-rose-600 animate-shake">
                {pinError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setPinError('');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
              >
                Save New PIN
              </button>
            </div>
          </form>
        )}
      </div>

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
          <p>
            5. <strong>Celebration Special Offers:</strong> On Birthday or Anniversary (highlighted across a 2-day window: the day before + actual day), send celebration wishes & coupon offers with 1 click directly without purchasing. On their purchase, choose manually to apply ₹100 OFF (min ₹800) or ₹250 OFF (min ₹1,000 for combo).
          </p>
        </div>
      </div>

      {/* Reset / Clear All Data */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-rose-600">
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Permanently wipe all customer profiles and recorded transaction bills to start with a fresh slate.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete ALL customer data and transactions? This cannot be undone.')) {
              clearAllData();
              alert('All data has been cleared successfully.');
            }
          }}
          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete All Data
        </button>
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
