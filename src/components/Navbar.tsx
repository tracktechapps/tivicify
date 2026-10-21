import React from 'react';
import { 
  Tv, 
  Film, 
  Radio, 
  Bookmark, 
  PlusCircle, 
  Search, 
  Settings, 
  Gamepad2,
  FolderPlus,
  HelpCircle,
  Baby,
  HardDrive,
  QrCode,
  LayoutGrid
} from 'lucide-react';
import { NavTab } from '../types';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSearch: () => void;
  onOpenAddCustom: () => void;
  onOpenImportM3U: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts?: () => void;
  onOpenInstallQr?: () => void;
  tvMode: boolean;
  onToggleTVMode: () => void;
  kidsMode: boolean;
  onToggleKidsMode: () => void;
  watchlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenAddCustom,
  onOpenImportM3U,
  onOpenSettings,
  onOpenShortcuts,
  onOpenInstallQr,
  tvMode,
  onToggleTVMode,
  kidsMode,
  onToggleKidsMode,
  watchlistCount,
}) => {
  return (
    <>
      {/* Top Navbar for TV, Tablet, and Desktop */}
      <header className="sticky top-0 z-40 w-full glass-nav px-4 md:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onSelectTab('home')}
              className="tv-focusable flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-white bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  TIVICIFY
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Universal TV
                </span>
              </div>
            </button>

            {/* Navigation Links (Desktop & TV) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => onSelectTab('home')}
                className={`tv-focusable px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'home'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onSelectTab('movies')}
                className={`tv-focusable px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'movies'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Movies & Shows
              </button>
              <button
                onClick={() => onSelectTab('live')}
                className={`tv-focusable px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  currentTab === 'live'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>Live TV</span>
              </button>
              <button
                onClick={() => onSelectTab('multiview')}
                className={`tv-focusable px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  currentTab === 'multiview'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multi-View</span>
              </button>
              <button
                onClick={() => onSelectTab('recordings')}
                className={`tv-focusable px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  currentTab === 'recordings'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-red-400" />
                <span>DVR & Saves</span>
              </button>
              <button
                onClick={() => onSelectTab('custom')}
                className={`tv-focusable px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'custom'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                My Stream Hub
              </button>
              <button
                onClick={() => onSelectTab('watchlist')}
                className={`tv-focusable px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  currentTab === 'watchlist'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Watchlist</span>
                {watchlistCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-indigo-500 text-white rounded-full">
                    {watchlistCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="tv-focusable p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
              title="Search Movies & Channels"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Add Custom Stream */}
            <button
              onClick={onOpenAddCustom}
              className="tv-focusable hidden sm:flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-gray-300 hover:text-white text-xs font-medium transition-colors"
              title="Add Custom URL Stream"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              <span>Add URL</span>
            </button>

            {/* Import M3U */}
            <button
              onClick={onOpenImportM3U}
              className="tv-focusable hidden sm:flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-gray-300 hover:text-white text-xs font-medium transition-colors"
              title="Import IPTV M3U Playlist"
            >
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              <span>Import M3U</span>
            </button>

            {/* Kids Mode Toggle */}
            <button
              onClick={onToggleKidsMode}
              className={`tv-focusable flex items-center space-x-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                kidsMode
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800/70 hover:bg-slate-700 text-gray-300 hover:text-white'
              }`}
              title={kidsMode ? 'Kids Safe Mode Active' : 'Switch to Kids Safe Mode'}
            >
              <Baby className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">{kidsMode ? 'Kids Mode ON' : 'Kids'}</span>
            </button>

            {/* TV Mode Toggle */}
            <button
              onClick={onToggleTVMode}
              className={`tv-focusable flex items-center space-x-1 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                tvMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-800/70 hover:bg-slate-700 text-gray-400 hover:text-gray-200'
              }`}
              title={tvMode ? 'TV Remote Mode Active' : 'Switch to TV Remote Mode'}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden lg:inline">{tvMode ? 'TV Mode ON' : 'TV Mode'}</span>
            </button>

            {/* QR Code Install Button */}
            {onOpenInstallQr && (
              <button
                onClick={onOpenInstallQr}
                className="tv-focusable flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600/25 to-blue-600/25 hover:from-cyan-600/40 hover:to-blue-600/40 text-cyan-300 hover:text-white border border-cyan-500/35 text-xs font-semibold transition-all hover:scale-105"
                title="Scan QR Code to install app on Phone or Tablet"
                aria-label="Scan QR Code to install app"
              >
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Get App (QR)</span>
              </button>
            )}

            {/* Shortcuts Help */}
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="tv-focusable p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors hidden sm:flex"
                title="TV Remote & Keyboard Shortcuts (?)"
                aria-label="Shortcuts Help"
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400/90" />
              </button>
            )}

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="tv-focusable p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
              title="Settings & APK Info"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Bar for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-slate-800/80 px-2 py-2 flex justify-around items-center">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            currentTab === 'home' ? 'text-blue-400 font-bold' : 'text-gray-400'
          }`}
        >
          <Tv className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectTab('movies')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            currentTab === 'movies' ? 'text-blue-400 font-bold' : 'text-gray-400'
          }`}
        >
          <Film className="w-5 h-5 mb-0.5" />
          <span>Movies</span>
        </button>

        <button
          onClick={() => onSelectTab('live')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            currentTab === 'live' ? 'text-blue-400 font-bold' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          </div>
          <span>Live TV</span>
        </button>

        <button
          onClick={() => onSelectTab('custom')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            currentTab === 'custom' ? 'text-blue-400 font-bold' : 'text-gray-400'
          }`}
        >
          <PlusCircle className="w-5 h-5 mb-0.5" />
          <span>Hub</span>
        </button>

        <button
          onClick={() => onSelectTab('recordings')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            currentTab === 'recordings' ? 'text-red-400 font-bold' : 'text-gray-400'
          }`}
        >
          <HardDrive className="w-5 h-5 mb-0.5" />
          <span>DVR</span>
        </button>

        <button
          onClick={() => onSelectTab('watchlist')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            currentTab === 'watchlist' ? 'text-blue-400 font-bold' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5 mb-0.5" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 flex items-center justify-center text-[9px] bg-indigo-500 text-white rounded-full">
                {watchlistCount}
              </span>
            )}
          </div>
          <span>Watchlist</span>
        </button>
      </nav>
    </>
  );
};
