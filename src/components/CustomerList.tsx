import React, { useState } from 'react';
import { Search, UserPlus, Phone, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CustomerListProps {
  onAddCustomerClick: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ onAddCustomerClick }) => {
  const { customers, selectedCustomerId, setSelectedCustomerId } = useApp();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const cleanPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/^\+91\s*/, '').replace(/^91(?=\d{10})/, '');
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Requirement 3: Pink color box if customer has DOB or Anniversary today
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-5.5rem)]">
      {/* Search & Add Header */}
      <div className="p-3.5 border-b border-gray-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Customers</h2>
            <p className="text-[11px] text-gray-400">{customers.length} total enrolled</p>
          </div>
          <button
            onClick={onAddCustomerClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Customer
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Customer items */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No customers found. Click <strong>Add Customer</strong> to create one.
          </div>
        ) : (
          filtered.map((customer) => {
            const isSelected = customer.id === selectedCustomerId;
            const balance = customer.balance || 0;
            const phoneDisplay = cleanPhone(customer.phone);

            return (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomerId(customer.id)}
                className={`p-3 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-50/70 border-l-4 border-amber-600 pl-2.5'
                    : 'hover:bg-gray-50/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Point badge replacing the first letter avatar */}
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <span className="text-[10px] leading-none text-amber-600">⭐</span>
                    <span className="leading-tight text-xs font-black">{customer.loyaltyPoints || 0}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-gray-900 text-xs truncate">
                        {customer.name}
                      </p>
                    </div>

                    {phoneDisplay && (
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                        <Phone className="w-2.5 h-2.5 text-gray-400" />
                        {phoneDisplay}
                      </p>
                    )}

                    {/* Dates: Rendered in pink box if today, no separate message (as requested) */}
                    {(customer.dob || customer.anniversary) && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] mt-0.5">
                        {customer.dob && (
                          <span
                            className={
                              isTodayDate(customer.dob)
                                ? 'bg-pink-100 text-pink-800 font-bold border border-pink-300 px-1.5 py-0.5 rounded shadow-2xs'
                                : 'text-gray-400'
                            }
                          >
                            DOB: {formatDateDisplay(customer.dob)}
                          </span>
                        )}
                        {customer.anniversary && (
                          <span
                            className={
                              isTodayDate(customer.anniversary)
                                ? 'bg-pink-100 text-pink-800 font-bold border border-pink-300 px-1.5 py-0.5 rounded shadow-2xs'
                                : 'text-gray-400'
                            }
                          >
                            Anniv: {formatDateDisplay(customer.anniversary)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        balance > 0
                          ? 'text-rose-600'
                          : balance < 0
                          ? 'text-emerald-600'
                          : 'text-gray-400'
                      }`}
                    >
                      ₹{Math.abs(balance).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">
                      {balance > 0 ? "You'll Get" : balance < 0 ? "You'll Give" : 'Settled'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
