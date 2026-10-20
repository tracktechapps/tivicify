import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Undo2,
  Play,
  Volume2,
  VolumeX,
  Tv,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface TVRemoteSimulatorProps {
  onBackToHome?: () => void;
}

export const TVRemoteSimulator: React.FC<TVRemoteSimulatorProps> = ({ onBackToHome }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const sendKey = (key: string) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-2xl shadow-amber-600/40 hover:scale-105 transition-all"
        title="Open TV Remote Simulator"
      >
        <Tv className="w-4 h-4" />
        <span className="hidden sm:inline">TV Remote Tester</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-50 bg-slate-950/95 border border-amber-500/50 rounded-3xl shadow-2xl backdrop-blur-xl transition-all duration-200 select-none ${
        isMinimized ? 'w-44 p-3' : 'w-56 p-4'
      }`}
    >
      {/* Remote Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-1.5 text-amber-400">
          <Tv className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Remote</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-gray-400 hover:text-white"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-gray-400 hover:text-white"
            title="Close Remote"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="pt-4 flex flex-col items-center">
          
          {/* D-Pad Circular Controller */}
          <div className="relative w-36 h-36 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center shadow-inner">
            
            {/* UP */}
            <button
              onClick={() => sendKey('ArrowUp')}
              className="absolute top-1 p-2 rounded-t-full text-gray-300 hover:text-amber-400 active:scale-90 transition-transform"
              title="Arrow Up"
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            {/* DOWN */}
            <button
              onClick={() => sendKey('ArrowDown')}
              className="absolute bottom-1 p-2 rounded-b-full text-gray-300 hover:text-amber-400 active:scale-90 transition-transform"
              title="Arrow Down"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            {/* LEFT */}
            <button
              onClick={() => sendKey('ArrowLeft')}
              className="absolute left-1 p-2 rounded-l-full text-gray-300 hover:text-amber-400 active:scale-90 transition-transform"
              title="Arrow Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* RIGHT */}
            <button
              onClick={() => sendKey('ArrowRight')}
              className="absolute right-1 p-2 rounded-r-full text-gray-300 hover:text-amber-400 active:scale-90 transition-transform"
              title="Arrow Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* CENTER OK / ENTER */}
            <button
              onClick={() => sendKey('Enter')}
              className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-90 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg transition-transform"
              title="Select / OK"
            >
              OK
            </button>
          </div>

          {/* Navigation Controls: Back & Home */}
          <div className="flex items-center justify-between w-full mt-4 px-2">
            <button
              onClick={() => sendKey('Escape')}
              className="flex flex-col items-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-gray-300 hover:text-amber-400 transition-colors"
              title="Back (Esc)"
            >
              <Undo2 className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">Back</span>
            </button>

            <button
              onClick={() => sendKey(' ')}
              className="flex flex-col items-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-gray-300 hover:text-amber-400 transition-colors"
              title="Play / Pause"
            >
              <Play className="w-4 h-4 mb-0.5 fill-current" />
              <span className="text-[10px]">Play</span>
            </button>

            <button
              onClick={() => sendKey('m')}
              className="flex flex-col items-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-gray-300 hover:text-amber-400 transition-colors"
              title="Mute"
            >
              <VolumeX className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">Mute</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
