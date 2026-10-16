import React, { useState, useEffect } from 'react';
import { UserCheck, X, Check, Calendar, Phone, User, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LoyaltyCustomer } from '../loyalty/types';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: LoyaltyCustomer;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ isOpen, onClose, customer }) => {
  const { updateCustomer, deleteCustomer } = useApp();
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone || '');
  const [dob, setDob] = useState(customer.dob || '');
  const [anniversary, setAnniversary] = useState(customer.anniversary || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(customer.name);
    setPhone(customer.phone || '');
    setDob(customer.dob || '');
    setAnniversary(customer.anniversary || '');
    setError(null);
  }, [customer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a customer name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    updateCustomer(customer.id, {
      name: name.trim(),
      phone: cleanPhone,
      dob: dob.trim() || undefined,
      anniversary: anniversary.trim() || undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete ${customer.name}? All transaction history and reward points will be removed.`)) {
      deleteCustomer(customer.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-gray-900 text-base">Edit Client Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Customer Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Ashok Garg"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile Number - No +91 */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Mobile / WhatsApp Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number (e.g. 9876543210)"
                maxLength={10}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Date of Birth (DOB)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date of Anniversary */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Date of Anniversary
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={anniversary}
                onChange={(e) => setAnniversary(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          {/* Save Changes Button */}
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
              Save Changes
            </button>
          </div>

          {/* Delete Customer Button */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Customer & History
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
