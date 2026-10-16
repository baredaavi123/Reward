import React from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import logoUrl from '../assets/Logo.png';

interface NavbarProps {
  activeTab: 'customers' | 'settings';
  setActiveTab: (tab: 'customers' | 'settings') => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const { settings, customers } = useApp();

  const totalPointsInCirculation = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs pt-[max(env(safe-area-inset-top,0px),28px)]">
      <div className="max-w-5xl mx-auto px-3.5 h-13 flex items-center justify-between">
        {/* Logo & Title: 'Zewar For You' shifted to the left */}
        <div
          onClick={() => setActiveTab('customers')}
          className="flex items-center gap-2.5 cursor-pointer select-none active:opacity-85 transition-opacity"
        >
          <img
            src={logoUrl}
            alt="Zewar For You Logo"
            className="w-9 h-9 rounded-xl object-contain bg-amber-50 border border-amber-200/60 p-0.5 shadow-2xs"
          />
          <div>
            <h1 className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight">
              Zewar For You
            </h1>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <span>{customers.length} Clients</span>
              <span>•</span>
              <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 inline" /> {totalPointsInCirculation} Pts
              </span>
            </p>
          </div>
        </div>

        {/* Tab Navigation: Only one Settings button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab(activeTab === 'settings' ? 'customers' : 'settings')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
            {settings.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            )}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Lock / Logout"
              className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
