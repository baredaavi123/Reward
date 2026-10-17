import React, { useState } from 'react';
import { Award, X, AlertCircle, Check } from 'lucide-react';
import { LoyaltySettings } from '../types';
import { calculateDiscountValue, validatePointsRedemption } from '../loyaltyEngine';

interface RewardRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePoints: number;
  settings: LoyaltySettings;
  onConfirmRedeem: (pointsToRedeem: number, discountAmount: number) => void;
}

export const RewardRedeemModal: React.FC<RewardRedeemModalProps> = ({
  isOpen,
  onClose,
  availablePoints,
  settings,
  onConfirmRedeem,
}) => {
  const [pointsInput, setPointsInput] = useState<number>(settings.minPointsToRedeem || 5);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const minPoints = settings.minPointsToRedeem || 5;
  const rate = settings.redemptionRate || 80;
  const discount = calculateDiscountValue(pointsInput, settings);
  const remainingPoints = availablePoints - pointsInput;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePointsRedemption(pointsInput, availablePoints, settings);
    if (!validation.valid) {
      setError(validation.error || 'Invalid points');
      return;
    }
    setError(null);
    onConfirmRedeem(pointsInput, discount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-amber-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-900 text-base">Redeem Reward Points</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="mt-4 space-y-4">
          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-900 flex justify-between items-center">
            <span>Available Points:</span>
            <strong className="text-sm text-amber-950 font-bold">{availablePoints} Pts</strong>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Points to Redeem (Min: {minPoints})
            </label>
            <input
              type="number"
              min={minPoints}
              max={availablePoints}
              step="1"
              value={pointsInput}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setPointsInput(val);
                setError(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold text-lg text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2">
            {[minPoints, 10, 20].map((preset) => (
              preset <= availablePoints ? (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setPointsInput(preset);
                    setError(null);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                    pointsInput === preset
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {preset} Pts
                </button>
              ) : null
            ))}
            <button
              type="button"
              onClick={() => {
                setPointsInput(availablePoints);
                setError(null);
              }}
              className="text-xs px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 font-semibold hover:bg-amber-100 ml-auto"
            >
              All ({availablePoints})
            </button>
          </div>

          {/* Discount Calculation Summary */}
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs space-y-1">
            <div className="flex justify-between text-emerald-900">
              <span>Redemption Rate:</span>
              <span className="font-semibold">₹{rate} / point</span>
            </div>
            <div className="flex justify-between text-emerald-950 text-sm font-bold border-t border-emerald-200 pt-1">
              <span>Bill Discount:</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-[11px] pt-0.5">
              <span>Remaining Balance:</span>
              <span>{Math.max(0, remainingPoints)} Pts</span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={availablePoints < minPoints}
              className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <Check className="w-4 h-4" />
              Apply Discount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
