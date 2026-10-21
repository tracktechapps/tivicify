import React, { useState } from 'react';
import { ShieldCheck, Lock, X, Delete, Check } from 'lucide-react';

interface ParentalPinModalProps {
  isOpen: boolean;
  mode: 'unlock' | 'set';
  currentPin?: string;
  onSuccess: (newPin?: string) => void;
  onClose: () => void;
}

export const ParentalPinModal: React.FC<ParentalPinModalProps> = ({
  isOpen,
  mode,
  currentPin = '',
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setError(false);

      if (next.length === 4) {
        if (mode === 'unlock') {
          if (next === currentPin) {
            onSuccess();
            setPin('');
          } else {
            setError(true);
            setTimeout(() => {
              setPin('');
              setError(false);
            }, 600);
          }
        } else {
          // Setting new PIN
          onSuccess(next);
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="tv-focusable absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-gray-400 hover:text-white transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-black text-white tracking-wide">
          {mode === 'unlock' ? 'Parental Control PIN' : 'Set 4-Digit Parental PIN'}
        </h2>
        <p className="text-xs text-gray-400 mt-1 mb-5">
          {mode === 'unlock'
            ? 'Enter your 4-digit PIN to exit Kids Safe Mode'
            : 'Enter a 4-digit master PIN to lock Kids Safe Mode'}
        </p>

        {/* PIN Digits Display Dots */}
        <div className={`flex items-center justify-center space-x-3 mb-6 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  error 
                    ? 'border-rose-500 bg-rose-500/30' 
                    : isFilled 
                      ? 'border-amber-400 bg-amber-400 shadow-md shadow-amber-400/50 scale-110' 
                      : 'border-slate-700 bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 mb-3 animate-pulse">
            Incorrect PIN. Please try again.
          </p>
        )}

        {/* Numeric PIN Pad Grid */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="tv-focusable py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold text-lg transition-transform active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="tv-focusable py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-gray-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="tv-focusable py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold text-lg transition-transform active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="tv-focusable py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};
