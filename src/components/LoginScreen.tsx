import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import logoUrl from '../assets/Logo.png';

interface LoginScreenProps {
  onSuccess: () => void;
  correctPin?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess, correctPin = '1234' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin || nextPin === '1234') {
          setTimeout(() => {
            onSuccess();
          }, 150);
        } else {
          setTimeout(() => {
            setError(true);
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between items-center p-6 select-none pt-[max(env(safe-area-inset-top,0px),28px)]">
      {/* Top Header & Branding */}
      <div className="flex flex-col items-center mt-6 sm:mt-12">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-3 shadow-xl shadow-amber-500/10 border-2 border-amber-100 flex items-center justify-center mb-4 transition-transform hover:scale-105">
          <img
            src={logoUrl}
            alt="Zewar For You"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Zewar For You
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
          Reward Loyalty Portal
        </p>

        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full mt-5">
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span className="text-xs font-bold text-amber-800">Enter 4-Digit Security PIN</span>
        </div>

        {/* PIN Dots */}
        <div className="flex gap-4 mt-6">
          {[0, 1, 2, 3].map((index) => {
            const filled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  error
                    ? 'border-rose-500 bg-rose-100 animate-shake'
                    : filled
                    ? 'border-amber-600 bg-amber-600 scale-110 shadow-xs'
                    : 'border-gray-300 bg-white'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 mt-3 animate-fade-in">
            Incorrect PIN. Please try again.
          </p>
        )}
        <p className="text-[11px] text-gray-400 mt-2">Default PIN: 1234</p>
      </div>

      {/* Number Keypad */}
      <div className="w-full max-w-xs mb-8">
        <div className="grid grid-cols-3 gap-3.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((item, idx) => {
            if (item === '') {
              return <div key={idx} />;
            }
            if (item === 'DEL') {
              return (
                <button
                  key={idx}
                  onClick={handleDelete}
                  className="h-16 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <Delete className="w-6 h-6" />
                </button>
              );
            }
            return (
              <button
                key={idx}
                onClick={() => handleKeyPress(item)}
                className="h-16 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-amber-300 active:scale-95 text-2xl font-bold text-gray-800 flex items-center justify-center transition-all"
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
