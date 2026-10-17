import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CustomerList } from './components/CustomerList';
import { CustomerDetail } from './components/CustomerDetail';
import { SettingsView } from './components/SettingsView';
import { AddCustomerModal } from './components/AddCustomerModal';
import { LoginScreen } from './components/LoginScreen';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'customers' | 'settings'>('customers');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const { selectedCustomerId, pin } = useApp();

  // 1. Show Login Screen on Start
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onSuccess={() => setIsAuthenticated(true)}
        correctPin={pin}
      />
    );
  }

  // 2. Main Authenticated Dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => setIsAuthenticated(false)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-2.5 sm:p-4">
        {activeTab === 'customers' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Left Customer List */}
            <div
              className={`md:col-span-5 ${
                selectedCustomerId ? 'hidden md:block' : 'block'
              }`}
            >
              <CustomerList onAddCustomerClick={() => setIsAddCustomerOpen(true)} />
            </div>

            {/* Right Customer Ledger & Loyalty Points */}
            <div
              className={`md:col-span-7 ${
                !selectedCustomerId ? 'hidden md:block' : 'block'
              }`}
            >
              <CustomerDetail />
            </div>
          </div>
        ) : (
          <SettingsView onBackToCustomers={() => setActiveTab('customers')} />
        )}
      </main>

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
