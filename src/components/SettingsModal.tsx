import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Key, 
  Gamepad2, 
  Smartphone, 
  Trash2, 
  ExternalLink,
  Download,
  Palette,
  Baby,
  Volume2,
  Sparkles,
  Ear,
  Zap,
  QrCode,
  Lock
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onClearHistory: () => void;
  apkPath?: string;
  onOpenInstallQr?: () => void;
  onPromptSetPin?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
  apkPath,
  onOpenInstallQr,
  onPromptSetPin,
}) => {
  const [apiKey, setApiKey] = useState(settings.tmdbApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ tmdbApiKey: apiKey.trim() });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all watch history and saved progress?')) {
      onClearHistory();
      setHistoryCleared(true);
      setTimeout(() => setHistoryCleared(false), 2000);
    }
  };

  const themes: { id: AppSettings['themeColor']; label: string; color: string }[] = [
    { id: 'blue', label: 'Universal Blue', color: 'bg-blue-500' },
    { id: 'red', label: 'Cinema Crimson', color: 'bg-red-500' },
    { id: 'purple', label: 'Cyberpunk Violet', color: 'bg-purple-500' },
    { id: 'amber', label: 'Vintage Gold', color: 'bg-amber-500' },
    { id: 'emerald', label: 'Emerald Sci-Fi', color: 'bg-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="tv-focusable absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-gray-400 hover:text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">App Settings & Customization</h2>
            <p className="text-xs text-gray-400">Personalize TV navigation, theme accents, audio & APK export</p>
          </div>
        </div>

        <div className="space-y-5">
          
          {/* Theme Accent Color */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-sky-400">
              <Palette className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Interface Theme Accent</h3>
            </div>
            <p className="text-xs text-gray-400">Choose your favorite UI color scheme</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {themes.map((th) => (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ themeColor: th.id })}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    settings.themeColor === th.id
                      ? 'border-white bg-slate-700 text-white shadow-md'
                      : 'border-slate-700 bg-slate-900/60 text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${th.color}`} />
                  <span>{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kids Safe Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center space-x-3">
              <Baby className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Kids & Family Safe Mode</h3>
                <p className="text-xs text-gray-400">
                  Filters catalog strictly to family animations, cartoons & space documentaries
                </p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ kidsMode: !settings.kidsMode })}
              className={`tv-focusable relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.kidsMode ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.kidsMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* TV Remote D-Pad Navigation Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center space-x-3">
              <Gamepad2 className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">TV D-Pad Remote Mode</h3>
                <p className="text-xs text-gray-400">
                  Enables spatial 10-foot UI navigation with remote arrow keys
                </p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ tvMode: !settings.tvMode })}
              className={`tv-focusable relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.tvMode ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.tvMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* TV Remote Sound Effects */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Interface Audio Ticks</h3>
                <p className="text-xs text-gray-400">
                  Tactile synthesized audio feedback on remote navigation & button clicks
                </p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEffects: !settings.soundEffects })}
              className={`tv-focusable relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEffects ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Low Internet Connectivity & Data Saver Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Low Internet / Data Saver Mode</h3>
                <p className="text-xs text-gray-400">
                  Caps stream resolution to 480p, stabilizes buffer on weak connections, and activates offline playlist cache
                </p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ lowBandwidthMode: !settings.lowBandwidthMode })}
              className={`tv-focusable relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.lowBandwidthMode ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.lowBandwidthMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Parental PIN Protection */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Parental Control 4-Digit PIN</h3>
                  <p className="text-xs text-gray-400">
                    Require a 4-digit PIN code to turn off Kids Safe Mode or access mature channels
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!settings.parentalPin && onPromptSetPin) {
                    onPromptSetPin();
                  } else {
                    onUpdateSettings({ enableParentalPin: !settings.enableParentalPin });
                  }
                }}
                className={`tv-focusable relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-3 ${
                  settings.enableParentalPin ? 'bg-amber-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableParentalPin ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
              <span className="text-gray-400">
                Status: {settings.enableParentalPin ? (
                  <strong className="text-amber-400">PIN Enabled</strong>
                ) : (
                  <strong className="text-gray-400">PIN Disabled</strong>
                )}
              </span>

              {onPromptSetPin && (
                <button
                  type="button"
                  onClick={onPromptSetPin}
                  className="tv-focusable px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 font-semibold text-xs transition-colors"
                >
                  {settings.parentalPin ? 'Change PIN' : 'Set 4-Digit PIN'}
                </button>
              )}
            </div>
          </div>

          {/* Android APK Section */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Android Mobile & Smart TV APK</h3>
                <p className="text-xs text-gray-400">
                  Cross-platform package built with Capacitor for Android phones, tablets & Smart TVs
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Package ID:</span>
                <span className="font-mono text-gray-200">com.tivicify.streaming</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Target Devices:</span>
                <span className="text-emerald-400 font-semibold">Mobile, Tablet, Android TV, Fire TV</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-blue-400 font-semibold">Compiled & Ready for Install</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {apkPath && (
                <a
                  href={apkPath}
                  download="Tivicify.apk"
                  className="tv-focusable py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK (21 MB)</span>
                </a>
              )}
              {onOpenInstallQr && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenInstallQr();
                  }}
                  className="tv-focusable py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02]"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR to Install</span>
                </button>
              )}
            </div>
          </div>

          {/* TMDB API Key */}
          <form onSubmit={handleSaveApiKey} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">TMDB Metadata API (Optional)</h3>
              </div>
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:underline flex items-center space-x-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-gray-400">
              Enter your free TMDB API key to dynamically browse and search over 1,000,000+ movies & TV shows.
            </p>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Paste your 32-character TMDB API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="tv-focusable px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                {savedSuccess ? 'Saved!' : 'Save Key'}
              </button>
            </div>
          </form>

          {/* Clear Watch History */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-white">Playback Cache & History</h3>
              <p className="text-xs text-gray-400">Clear saved progress and continue watching list</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="tv-focusable flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{historyCleared ? 'Cleared!' : 'Clear History'}</span>
            </button>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="tv-focusable px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 text-sm font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
