import React from 'react';
import { X, Keyboard, Gamepad2, ArrowRight } from 'lucide-react';

interface ShortcutsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsGuideModal: React.FC<ShortcutsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="tv-focusable absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-gray-400 hover:text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">TV Remote & Keyboard Shortcuts</h2>
            <p className="text-xs text-gray-400">Controls for Smart TVs, Laptops & Desktops</p>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* TV Remote Controls */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center space-x-1.5">
              <Gamepad2 className="w-4 h-4" />
              <span>Smart TV D-Pad Remote</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">D-Pad Arrows</span>
                <span className="text-amber-400 font-mono">Move Focus</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">OK / Enter</span>
                <span className="text-amber-400 font-mono">Select / Play</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">Back Button</span>
                <span className="text-amber-400 font-mono">Exit / Return</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">Play / Pause</span>
                <span className="text-amber-400 font-mono">Toggle Media</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center space-x-1.5">
              <Keyboard className="w-4 h-4" />
              <span>Laptop & Desktop Keyboard</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">Space / Enter</span>
                <span className="text-blue-400 font-mono">Play / Pause</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">Left / Right</span>
                <span className="text-blue-400 font-mono">Seek ±10s</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">Up / Down</span>
                <span className="text-blue-400 font-mono">Volume ±10%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">F Key</span>
                <span className="text-blue-400 font-mono">Fullscreen</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">M Key</span>
                <span className="text-blue-400 font-mono">Mute / Unmute</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">Q Key</span>
                <span className="text-cyan-400 font-mono">Scan QR / Install</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">V Key</span>
                <span className="text-cyan-400 font-mono">Multi-View (Split TV)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-gray-300">Esc / Back</span>
                <span className="text-blue-400 font-mono">Close Player</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="tv-focusable px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
