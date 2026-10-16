import React, { useState } from 'react';
import { Award, X, Plus, Minus, Check } from 'lucide-react';
import { LoyaltyCustomer } from '../types';

interface ManualPointsAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: LoyaltyCustomer;
  onAdjustPoints: (customerId: string, newPoints: number, reason: string) => void;
}

export const ManualPointsAdjustModal: React.FC<ManualPointsAdjustModalProps> = ({
  isOpen,
  onClose,
  customer,
  onAdjustPoints,
}) => {
  const [pointsDelta, setPointsDelta] = useState<number>(1);
  const [mode, setMode] = useState<'add' | 'deduct'>('add');
  const [reason, setReason] = useState<string>('');

  if (!isOpen) return null;

  const currentPoints = customer.loyaltyPoints || 0;
  const finalNewPoints =
    mode === 'add'
      ? currentPoints + Math.max(0, pointsDelta)
      : Math.max(0, currentPoints - Math.max(0, pointsDelta));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalNewPoints === currentPoints) {
      onClose();
      return;
    }
    const defaultReason = mode === 'add' ? 'Manual reward points added' : 'Manual points deduction';
    onAdjustPoints(customer.id, finalNewPoints, reason.trim() || defaultReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-900 text-base">Adjust Reward Points</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 flex justify-between items-center">
            <span>Customer:</span>
            <strong className="text-gray-900">{customer.name}</strong>
          </div>

          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'add'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Points
            </button>
            <button
              type="button"
              onClick={() => setMode('deduct')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'deduct'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              Deduct Points
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Points to {mode === 'add' ? 'Add' : 'Deduct'}
            </label>
            <input
              type="number"
              min="1"
              value={pointsDelta}
              onChange={(e) => setPointsDelta(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold text-lg text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs flex justify-between items-center">
            <div className="text-gray-600">
              Current: <strong className="text-gray-800">{currentPoints} Pts</strong>
            </div>
            <div className="font-bold text-amber-900 text-sm">
              New Total: {finalNewPoints} Pts
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Reason / Audit Note (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Festival bonus, return adjustment..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

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
              className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <Check className="w-4 h-4" />
              Save Points
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
