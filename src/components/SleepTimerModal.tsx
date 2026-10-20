import React from 'react';
import { X, Moon, Clock, Check, BellRing } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMinutes: number | null; // null if off
  remainingSeconds: number | null;
  onSetTimer: (minutes: number | null) => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  activeMinutes,
  remainingSeconds,
  onSetTimer,
}) => {
  if (!isOpen) return null;

  const presets = [
    { label: 'Off', value: null },
    { label: '15 Minutes', value: 15 },
    { label: '30 Minutes', value: 30 },
    { label: '45 Minutes', value: 45 },
    { label: '60 Minutes', value: 60 },
    { label: '90 Minutes', value: 90 },
  ];

  const formatRemaining = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="tv-focusable absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-gray-400 hover:text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Bedtime Sleep Timer</h2>
            <p className="text-xs text-gray-400">Automatically pause playback</p>
          </div>
        </div>

        {activeMinutes && remainingSeconds !== null && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between text-indigo-300 text-xs">
            <div className="flex items-center space-x-2">
              <BellRing className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Timer active:</span>
            </div>
            <span className="font-mono font-bold text-white">{formatRemaining(remainingSeconds)}</span>
          </div>
        )}

        <div className="space-y-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                onSetTimer(preset.value);
                onClose();
              }}
              className={`tv-focusable w-full p-3 rounded-xl text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                activeMinutes === preset.value
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{preset.label}</span>
              </div>
              {activeMinutes === preset.value && <Check className="w-4 h-4 text-white" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
