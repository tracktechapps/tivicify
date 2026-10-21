import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  Tablet, 
  Wifi, 
  Globe, 
  Share2, 
  Info,
  CheckCircle2,
  Tv
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface InstallQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  apkPath?: string;
}

type QrSource = 'github' | 'wifi' | 'web';

export const InstallQrModal: React.FC<InstallQrModalProps> = ({
  isOpen,
  onClose,
  apkPath = './Tivicify.apk'
}) => {
  const [source, setSource] = useState<QrSource>('github');
  const [copied, setCopied] = useState(false);
  const [customIp, setCustomIp] = useState('192.168.43.116');

  if (!isOpen) return null;

  // Universal Direct Download URLs
  const githubApkUrl = 'https://github.com/tracktechapps/tivicify/raw/main/Tivicify.apk';
  const localWifiUrl = `http://${customIp}/tivicify/Tivicify.apk`;
  const webAppUrl = typeof window !== 'undefined' ? window.location.href : 'https://github.com/tracktechapps/tivicify';

  const activeUrl = source === 'github' 
    ? githubApkUrl 
    : source === 'wifi' 
      ? localWifiUrl 
      : webAppUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tivicify Streaming App',
          text: 'Download and install Tivicify APK on your Android phone or tablet:',
          url: activeUrl,
        });
      } catch {
        // Ignored or cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="tv-focusable absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Close (Esc)"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5 pr-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <span>Scan to Install Tivicify</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                APK Ready
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Scan with your Phone or Tablet camera to download and install the app
            </p>
          </div>
        </div>

        {/* Source Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/90 rounded-xl mb-5 border border-slate-700/60">
          <button
            onClick={() => setSource('github')}
            className={`tv-focusable flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              source === 'github'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="truncate">GitHub Direct</span>
          </button>

          <button
            onClick={() => setSource('wifi')}
            className={`tv-focusable flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              source === 'wifi'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span className="truncate">Local Wi-Fi</span>
          </button>

          <button
            onClick={() => setSource('web')}
            className={`tv-focusable flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              source === 'web'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="truncate">Web / PWA</span>
          </button>
        </div>

        {/* Main QR Card & Instructions Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center mb-6">
          
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 shadow-inner">
            <div className="p-3.5 bg-white rounded-2xl shadow-2xl flex items-center justify-center ring-4 ring-blue-500/20">
              <QRCodeSVG
                value={activeUrl}
                size={210}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="mt-3.5 flex items-center space-x-2 text-[11px] text-gray-400 font-medium text-center">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Android Phones</span>
              <span>•</span>
              <Tablet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tablets & TV</span>
            </div>

            {source === 'wifi' && (
              <div className="mt-3 w-full">
                <label className="text-[10px] text-gray-400 block mb-1">Local Host IP (Edit if needed):</label>
                <input
                  type="text"
                  value={customIp}
                  onChange={(e) => setCustomIp(e.target.value)}
                  className="w-full text-center px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Step-by-Step Installation Instructions */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>3 Quick Steps to Install</span>
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Scan with Camera</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Open Camera, Google Lens, or any QR scanner on your phone or tablet and point it at the code.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Download Tivicify.apk</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Tap the popup notification to download the APK package (~21 MB).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Tap Open & Install</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Tap Open. If Android warns about unknown sources, toggle <strong className="text-gray-200">Allow</strong> to complete install.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Specs Pill */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">Package:</span>
              <span className="font-mono text-gray-300 font-semibold">com.tivicify.streaming</span>
            </div>
          </div>
        </div>

        {/* URL Bar & Action Buttons */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Download URL:</span>
            <p className="font-mono text-xs text-sky-300 truncate select-all">{activeUrl}</p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopy}
              className="tv-focusable flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
              title="Copy download link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-300" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className="tv-focusable px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
                title="Share link"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Built with Android Tablet & Mobile support</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <a
              href={apkPath}
              download="Tivicify.apk"
              className="tv-focusable flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Direct APK Download</span>
            </a>

            <button
              onClick={onClose}
              className="tv-focusable px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
