import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Film, 
  Radio, 
  Bookmark, 
  PlusCircle, 
  Tv, 
  Compass, 
  Clock, 
  FolderPlus,
  Play,
  Trash2
} from 'lucide-react';
import { MediaItem, ChannelItem, NavTab, AppSettings, WatchProgress } from './types';
import { CURATED_MEDIA, CURATED_CHANNELS } from './data/curatedMedia';
import { storageService } from './services/storageService';
import { tmdbService } from './services/tmdbService';
import { useTVNavigation } from './hooks/useTVNavigation';

// Components
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MediaCarousel } from './components/MediaCarousel';
import { MediaCard } from './components/MediaCard';
import { VideoPlayer } from './components/VideoPlayer';
import { MediaDetailModal } from './components/MediaDetailModal';
import { LiveTVGuide } from './components/LiveTVGuide';
import { CustomStreamModal } from './components/CustomStreamModal';
import { M3UImporterModal } from './components/M3UImporterModal';
import { SearchModal } from './components/SearchModal';
import { SettingsModal } from './components/SettingsModal';
import { TVRemoteSimulator } from './components/TVRemoteSimulator';
import { ShortcutsGuideModal } from './components/ShortcutsGuideModal';
import { MiniPlayer } from './components/MiniPlayer';
import { SavedRecordingsView } from './components/SavedRecordingsView';
import { InstallQrModal } from './components/InstallQrModal';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [isPlayingMini, setIsPlayingMini] = useState(true);

  // Modals state
  const [searchOpen, setSearchOpen] = useState(false);
  const [addCustomOpen, setAddCustomOpen] = useState(false);
  const [importM3UOpen, setImportM3UOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [installQrOpen, setInstallQrOpen] = useState(false);

  // User state
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [progressList, setProgressList] = useState<WatchProgress[]>([]);
  const [customStreams, setCustomStreams] = useState<MediaItem[]>([]);
  const [customChannels, setCustomChannels] = useState<ChannelItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [tmdbTrending, setTmdbTrending] = useState<MediaItem[]>([]);
  const [movieFilter, setMovieFilter] = useState('All');

  // Load persisted data
  useEffect(() => {
    setWatchlist(storageService.getWatchlist());
    setProgressList(storageService.getProgressList());
    setCustomStreams(storageService.getCustomStreams());
    setCustomChannels(storageService.getCustomChannels());
  }, []);

  // Fetch TMDB trending if API key exists
  useEffect(() => {
    if (settings.tmdbApiKey) {
      tmdbService.getTrending(settings.tmdbApiKey).then(setTmdbTrending);
    }
  }, [settings.tmdbApiKey]);

  // TV D-Pad Remote Navigation Hook
  useTVNavigation({
    enabled: settings.tvMode,
    soundEffects: settings.soundEffects,
    onBack: () => {
      if (activeMedia) {
        setActiveMedia(null);
      } else if (detailMedia) {
        setDetailMedia(null);
      } else if (searchOpen) {
        setSearchOpen(false);
      } else if (addCustomOpen) {
        setAddCustomOpen(false);
      } else if (importM3UOpen) {
        setImportM3UOpen(false);
      } else if (settingsOpen) {
        setSettingsOpen(false);
      } else if (shortcutsOpen) {
        setShortcutsOpen(false);
      } else if (installQrOpen) {
        setInstallQrOpen(false);
      } else if (currentTab !== 'home') {
        setCurrentTab('home');
      }
    },
  });

  // Global '?' and 'q' shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;
      if (e.key === '?') {
        setShortcutsOpen((prev) => !prev);
      } else if (e.key === 'q' || e.key === 'Q') {
        setInstallQrOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  // Play next episode / video handler
  const handlePlayNext = () => {
    if (!activeMedia) return;
    const index = CURATED_MEDIA.findIndex((m) => m.id === activeMedia.id);
    if (index >= 0 && index < CURATED_MEDIA.length - 1) {
      setActiveMedia(CURATED_MEDIA[index + 1]);
    }
  };

  // Watch progress map
  const progressMap = useMemo(() => {
    const map: Record<string, number> = {};
    progressList.forEach((p) => {
      map[p.mediaId] = p.percentage;
    });
    return map;
  }, [progressList]);

  // Filter media for Kids Safe Mode if active
  const baseCatalog = useMemo(() => {
    if (settings.kidsMode) {
      return CURATED_MEDIA.filter(
        (m) => m.type === 'animation' || m.genres.includes('Family') || m.type === 'documentary'
      );
    }
    return CURATED_MEDIA;
  }, [settings.kidsMode]);

  // Featured hero spotlight items
  const heroSpotlights = useMemo(() => {
    const spots = baseCatalog.filter((m) => m.featured || (m.rating && parseFloat(m.rating) >= 8.5));
    return spots.length > 0 ? spots.slice(0, 4) : baseCatalog.slice(0, 3);
  }, [baseCatalog]);

  // Curated categories
  const blenderMovies = useMemo(() => baseCatalog.filter((m) => m.director?.includes('Blender')), [baseCatalog]);
  const classicCinema = useMemo(() => baseCatalog.filter((m) => m.isPublicDomain && m.type === 'movie'), [baseCatalog]);
  const classicSeries = useMemo(() => baseCatalog.filter((m) => m.type === 'tv'), [baseCatalog]);
  const animations = useMemo(() => baseCatalog.filter((m) => m.type === 'animation'), [baseCatalog]);
  const documentaries = useMemo(() => baseCatalog.filter((m) => m.type === 'documentary'), [baseCatalog]);

  // Continue watching media items
  const continueWatchingItems = useMemo(() => {
    return progressList
      .map((p) => {
        const found =
          CURATED_MEDIA.find((m) => m.id === p.mediaId) ||
          customStreams.find((m) => m.id === p.mediaId);
        return found;
      })
      .filter((m): m is MediaItem => !!m);
  }, [progressList, customStreams]);

  // Watchlist handlers
  const handleToggleWatchlist = (media: MediaItem) => {
    storageService.toggleWatchlist(media);
    setWatchlist(storageService.getWatchlist());
  };

  const isInWatchlist = (id: string) => watchlist.some((item) => item.id === id);

  // Custom Stream handlers
  const handleAddCustomStream = (item: MediaItem) => {
    storageService.addCustomStream(item);
    setCustomStreams(storageService.getCustomStreams());
  };

  const handleRemoveCustomStream = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.removeCustomStream(id);
    setCustomStreams(storageService.getCustomStreams());
  };

  // M3U Channels handlers
  const handleImportChannels = (channels: ChannelItem[]) => {
    storageService.saveCustomChannels(channels);
    setCustomChannels(channels);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = storageService.saveSettings(newSettings);
    setSettings(updated);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('tivicify_progress');
    setProgressList([]);
  };

  const themeGradients: Record<AppSettings['themeColor'], string> = {
    blue: 'from-blue-950/25 via-[#080c14] to-[#080c14]',
    red: 'from-red-950/25 via-[#080c14] to-[#080c14]',
    purple: 'from-purple-950/25 via-[#080c14] to-[#080c14]',
    amber: 'from-amber-950/25 via-[#080c14] to-[#080c14]',
    emerald: 'from-emerald-950/25 via-[#080c14] to-[#080c14]',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeGradients[settings.themeColor || 'blue']} text-gray-100 flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-500`}>
      {/* Top / Mobile Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAddCustom={() => setAddCustomOpen(true)}
        onOpenImportM3U={() => setImportM3UOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenInstallQr={() => setInstallQrOpen(true)}
        tvMode={settings.tvMode}
        onToggleTVMode={() => handleUpdateSettings({ tvMode: !settings.tvMode })}
        kidsMode={settings.kidsMode}
        onToggleKidsMode={() => handleUpdateSettings({ kidsMode: !settings.kidsMode })}
        watchlistCount={watchlist.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 pb-24 md:pb-12">
        {/* ================= HOME TAB ================= */}
        {currentTab === 'home' && (
          <div>
            {/* Cinematic Hero */}
            <HeroBanner
              spotlights={heroSpotlights}
              onPlay={(item) => {
                setActiveMedia(item);
                setIsMiniPlayer(false);
              }}
              onOpenDetails={setDetailMedia}
              onToggleWatchlist={handleToggleWatchlist}
              isInWatchlist={isInWatchlist}
            />

            {/* Continue Watching Section */}
            {continueWatchingItems.length > 0 && (
              <MediaCarousel
                title="Continue Watching"
                icon={Clock}
                items={continueWatchingItems}
                onSelectMedia={setActiveMedia}
                aspectRatio="backdrop"
                progressMap={progressMap}
              />
            )}

            {/* Blender 4K Open Source Masterpieces */}
            <MediaCarousel
              title="Blender 4K Open Cinema"
              icon={Sparkles}
              items={blenderMovies}
              onSelectMedia={setDetailMedia}
              aspectRatio="backdrop"
              progressMap={progressMap}
            />

            {/* Public Domain Cinema Classics */}
            <MediaCarousel
              title="Restored Public Domain Feature Films"
              icon={Film}
              items={classicCinema}
              onSelectMedia={setDetailMedia}
              aspectRatio="poster"
              progressMap={progressMap}
            />

            {/* Classic TV Series & Sitcoms */}
            {classicSeries.length > 0 && (
              <MediaCarousel
                title="Classic TV Series & Shows"
                icon={Tv}
                items={classicSeries}
                onSelectMedia={setDetailMedia}
                aspectRatio="backdrop"
                progressMap={progressMap}
              />
            )}

            {/* Golden Age Cartoons & Animation */}
            <MediaCarousel
              title="Golden Age Animation & Cartoons"
              icon={Tv}
              items={animations}
              onSelectMedia={setDetailMedia}
              aspectRatio="backdrop"
              progressMap={progressMap}
            />

            {/* Documentaries & Space Exploration */}
            <MediaCarousel
              title="Science & Space Exploration"
              icon={Compass}
              items={documentaries}
              onSelectMedia={setDetailMedia}
              aspectRatio="backdrop"
              progressMap={progressMap}
            />

            {/* TMDB Trending (if available) */}
            {tmdbTrending.length > 0 && (
              <MediaCarousel
                title="Trending Movies & Shows (TMDB)"
                icon={Film}
                items={tmdbTrending}
                onSelectMedia={setDetailMedia}
                aspectRatio="poster"
              />
            )}

            {/* User Custom Streams */}
            {customStreams.length > 0 && (
              <MediaCarousel
                title="My Custom Video Streams"
                icon={PlusCircle}
                items={customStreams}
                onSelectMedia={setDetailMedia}
                aspectRatio="backdrop"
              />
            )}
          </div>
        )}

        {/* ================= MOVIES & SHOWS TAB ================= */}
        {currentTab === 'movies' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white">Feature Films, Series & Documentaries</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Browse complete legal movies, classic TV series, animations, and historical documentaries.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                {['All', 'Movies', 'TV Series', 'Documentary', 'Animation', 'Comedy', 'Mystery', 'Horror', 'Sci-Fi', 'Public Domain'].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setMovieFilter(filter)}
                      className={`tv-focusable px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        movieFilter === filter
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300'
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Movies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {baseCatalog.filter((item) => {
                if (movieFilter === 'All') return true;
                if (movieFilter === 'Movies') return item.type === 'movie';
                if (movieFilter === 'TV Series') return item.type === 'tv';
                if (movieFilter === 'Documentary') return item.type === 'documentary';
                if (movieFilter === 'Animation') return item.type === 'animation';
                if (movieFilter === 'Public Domain') return item.isPublicDomain;
                return item.genres.includes(movieFilter);
              }).map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onSelect={setDetailMedia}
                  aspectRatio="poster"
                  progressPercentage={progressMap[item.id]}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================= LIVE TV GUIDE TAB ================= */}
        {currentTab === 'live' && (
          <LiveTVGuide
            channels={CURATED_CHANNELS}
            customChannels={customChannels}
            onPlayChannel={setActiveMedia}
            onOpenImportM3U={() => setImportM3UOpen(true)}
            onChannelsPopulated={(newChannels) => {
              const combined = [...customChannels];
              newChannels.forEach((nc) => {
                if (!combined.some((c) => c.streamUrl === nc.streamUrl)) {
                  combined.push(nc);
                }
              });
              handleImportChannels(combined);
            }}
          />
        )}

        {/* ================= CUSTOM STREAM HUB TAB ================= */}
        {currentTab === 'custom' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/30">
              <div>
                <h1 className="text-3xl font-black text-white">Custom Stream & IPTV Hub</h1>
                <p className="text-sm text-gray-400 mt-1 max-w-xl">
                  Add your own direct video URLs (MP4, WebM, HLS M3U8) or import complete IPTV playlists.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setAddCustomOpen(true)}
                  className="tv-focusable flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all hover:scale-105 shadow-md shadow-blue-600/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add URL Stream</span>
                </button>

                <button
                  onClick={() => setImportM3UOpen(true)}
                  className="tv-focusable flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-sm font-semibold transition-all hover:scale-105"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Import M3U</span>
                </button>
              </div>
            </div>

            {/* Custom Added Streams */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Added Video Streams ({customStreams.length})</h2>
              {customStreams.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
                  <PlusCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-gray-300">No custom streams added yet</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Click "Add URL Stream" to paste any online video link or HLS live stream.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {customStreams.map((stream) => (
                    <div
                      key={stream.id}
                      onClick={() => setActiveMedia(stream)}
                      className="tv-focusable group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-blue-500/60 p-3 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <div className="aspect-video rounded-lg overflow-hidden bg-slate-950 mb-3 relative">
                        <img
                          src={stream.backdropUrl || stream.posterUrl}
                          alt={stream.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-blue-400 fill-current" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-gray-100 group-hover:text-blue-400 line-clamp-1">
                            {stream.title}
                          </h4>
                          <span className="text-xs text-gray-500">{stream.genres[0]} • {stream.streamType.toUpperCase()}</span>
                        </div>
                        <button
                          onClick={(e) => handleRemoveCustomStream(stream.id, e)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Stream"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Imported IPTV Channels */}
            {customChannels.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Imported IPTV Channels ({customChannels.length})</h2>
                  <button
                    onClick={() => {
                      if (window.confirm('Remove all custom imported IPTV channels?')) {
                        storageService.clearCustomChannels();
                        setCustomChannels([]);
                      }
                    }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Clear All Channels
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {customChannels.slice(0, 12).map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => {
                        setActiveMedia({
                          id: channel.id,
                          title: channel.name,
                          description: channel.epgDescription || 'IPTV Live Stream',
                          type: 'live',
                          source: 'iptv',
                          genres: ['IPTV', channel.category],
                          posterUrl: channel.logoUrl || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=500&q=80',
                          backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
                          streamUrl: channel.streamUrl,
                          streamType: 'hls',
                          year: 2024,
                          duration: 'Live',
                          rating: 'Live',
                        });
                      }}
                      className="tv-focusable flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 cursor-pointer transition-all"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {channel.logoUrl ? (
                          <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tv className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-gray-200 truncate">{channel.name}</h4>
                        <span className="text-[10px] text-gray-400">{channel.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= RECORDINGS & DVR TAB ================= */}
        {currentTab === 'recordings' && (
          <SavedRecordingsView
            onPlayRecording={(media) => {
              setActiveMedia(media);
              setIsMiniPlayer(false);
            }}
          />
        )}

        {/* ================= WATCHLIST TAB ================= */}
        {currentTab === 'watchlist' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white">My Watchlist ({watchlist.length})</h1>
              <p className="text-sm text-gray-400 mt-1">
                Saved movies, documentaries, and animations ready to play.
              </p>
            </div>

            {watchlist.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
                <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-300">Your Watchlist is empty</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Add movies from the home catalog or movies section by clicking the bookmark icon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchlist.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onSelect={setDetailMedia}
                    aspectRatio="poster"
                    progressPercentage={progressMap[item.id]}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating On-Screen TV Remote Simulator */}
      <TVRemoteSimulator onBackToHome={() => setCurrentTab('home')} />

      {/* Video Player Modal */}
      {activeMedia && !isMiniPlayer && (
        <VideoPlayer
          media={activeMedia}
          onClose={() => {
            setActiveMedia(null);
            setIsMiniPlayer(false);
            setProgressList(storageService.getProgressList());
          }}
          onPlayNext={handlePlayNext}
          onMinimize={() => setIsMiniPlayer(true)}
          liveChannels={CURATED_CHANNELS}
          onSwitchChannel={(item) => setActiveMedia(item)}
        />
      )}

      {/* In-App Floating Mini-Player */}
      {activeMedia && isMiniPlayer && (
        <MiniPlayer
          media={activeMedia}
          isPlaying={isPlayingMini}
          onTogglePlay={() => setIsPlayingMini(!isPlayingMini)}
          onExpand={() => setIsMiniPlayer(false)}
          onClose={() => {
            setActiveMedia(null);
            setIsMiniPlayer(false);
          }}
        />
      )}

      {/* Media Detail Modal */}
      {detailMedia && (
        <MediaDetailModal
          media={detailMedia}
          onClose={() => setDetailMedia(null)}
          onPlay={setActiveMedia}
          onToggleWatchlist={handleToggleWatchlist}
          isInWatchlist={isInWatchlist(detailMedia.id)}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        curatedItems={CURATED_MEDIA}
        customItems={customStreams}
        channels={[...CURATED_CHANNELS, ...customChannels]}
        onSelectMedia={setDetailMedia}
        onPlayMedia={(media) => {
          setActiveMedia(media);
          setIsMiniPlayer(false);
        }}
        tmdbApiKey={settings.tmdbApiKey}
      />

      {/* Add Custom Stream Modal */}
      <CustomStreamModal
        isOpen={addCustomOpen}
        onClose={() => setAddCustomOpen(false)}
        onAddStream={handleAddCustomStream}
      />

      {/* Import M3U Modal */}
      <M3UImporterModal
        isOpen={importM3UOpen}
        onClose={() => setImportM3UOpen(false)}
        onImportChannels={handleImportChannels}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearHistory={handleClearHistory}
        apkPath="./Tivicify.apk"
        onOpenInstallQr={() => setInstallQrOpen(true)}
      />

      {/* TV Remote & Keyboard Shortcuts Modal */}
      <ShortcutsGuideModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Install App QR Code Modal */}
      <InstallQrModal
        isOpen={installQrOpen}
        onClose={() => setInstallQrOpen(false)}
        apkPath="./Tivicify.apk"
      />
    </div>
  );
}

export default App;
