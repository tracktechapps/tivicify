import React, { useState } from 'react';
import { 
  Radio, 
  Play, 
  Tv, 
  FolderPlus, 
  Globe, 
  Search, 
  Loader2, 
  CheckCircle2,
  Compass,
  Sparkles,
  Zap,
  X,
  LayoutGrid,
  Clock,
  Calendar,
  Layers
} from 'lucide-react';
import { ChannelItem, MediaItem } from '../types';
import { WORLD_COUNTRIES, IPTV_ORG_DIRECTORIES, worldTvService } from '../services/worldTvService';
import { epgService } from '../services/epgService';

interface LiveTVGuideProps {
  channels: ChannelItem[];
  customChannels: ChannelItem[];
  onPlayChannel: (media: MediaItem) => void;
  onOpenImportM3U: () => void;
  onChannelsPopulated?: (newChannels: ChannelItem[]) => void;
  onOpenMultiView?: () => void;
}

export const LiveTVGuide: React.FC<LiveTVGuideProps> = ({
  channels,
  customChannels,
  onPlayChannel,
  onOpenImportM3U,
  onChannelsPopulated,
  onOpenMultiView,
}) => {
  const [activeTab, setActiveTab] = useState<'countries' | 'categories' | 'freetv'>('countries');
  const [viewMode, setViewMode] = useState<'grid' | 'epg'>('grid');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingDirectory, setIsLoadingDirectory] = useState<boolean>(false);
  const [populatedSuccess, setPopulatedSuccess] = useState<string | null>(null);

  const allChannels = [...channels, ...customChannels];

  // Extract unique categories
  const categories = ['All', 'Kids', 'Tech', 'News', 'Sports', 'Movies', 'Entertainment', 'Culture', 'Religious', 'Music'];

  // Free-TV directories vs IPTV-org category directories
  const freetvDirectories = IPTV_ORG_DIRECTORIES.filter((d) => d.group === 'freetv');
  const iptvOrgDirectories = IPTV_ORG_DIRECTORIES.filter((d) => d.group !== 'freetv');

  // Filter channels with complete null-safety & global search fallback
  const isSearching = searchQuery.trim().length > 0;
  const normalizedSearch = searchQuery.toLowerCase().trim();

  const filteredChannels = allChannels.filter((ch) => {
    // When user enters a search query, search globally across all loaded channels
    if (isSearching) {
      const matchName = (ch.name || '').toLowerCase().includes(normalizedSearch);
      const matchCat = (ch.category || '').toLowerCase().includes(normalizedSearch);
      const matchProg = (ch.currentProgram || '').toLowerCase().includes(normalizedSearch);
      const matchCountry = (ch.country || '').toLowerCase().includes(normalizedSearch);
      return matchName || matchCat || matchProg || matchCountry;
    }

    // Country filter (in countries tab)
    if (activeTab === 'countries' && selectedCountry !== 'all') {
      const countryConfig = WORLD_COUNTRIES.find((c) => c.code === selectedCountry);
      if (countryConfig && ch.country) {
        const countryLower = ch.country.toLowerCase();
        const matchesName = countryLower.includes(countryConfig.name.toLowerCase());
        const matchesFlag = ch.country.includes(countryConfig.flag);
        if (!matchesName && !matchesFlag) {
          return false;
        }
      }
    }

    // Category filter
    if (selectedCategory !== 'All') {
      const catLower = (ch.category || '').toLowerCase();
      const targetLower = selectedCategory.toLowerCase();
      if (!catLower.includes(targetLower)) {
        return false;
      }
    }

    return true;
  });

  const handleCountrySelect = async (countryCode: string) => {
    setSelectedCountry(countryCode);
    if (countryCode === 'all') return;

    const country = WORLD_COUNTRIES.find((c) => c.code === countryCode);
    if (!country) return;

    const existingForCountry = allChannels.filter(
      (c) => c.country && (c.country.includes(country.flag) || c.country.toLowerCase().includes(country.name.toLowerCase()))
    );

    if (existingForCountry.length < 5) {
      setIsLoadingDirectory(true);
      try {
        const fetched = await worldTvService.fetchCountryChannels(countryCode);
        if (fetched.length > 0 && onChannelsPopulated) {
          onChannelsPopulated(fetched);
          setPopulatedSuccess(`Loaded ${fetched.length} live channels from ${country.name}!`);
          setTimeout(() => setPopulatedSuccess(null), 3500);
        }
      } catch (err) {
        console.error('Error fetching country channels:', err);
      } finally {
        setIsLoadingDirectory(false);
      }
    }
  };

  const handleDirectorySelect = async (dirId: string) => {
    setSelectedDirectory(dirId);
    const dir = IPTV_ORG_DIRECTORIES.find((d) => d.id === dirId);
    if (!dir) return;

    setIsLoadingDirectory(true);
    try {
      const fetched = await worldTvService.fetchDirectoryPlaylist(dirId);
      if (fetched.length > 0 && onChannelsPopulated) {
        onChannelsPopulated(fetched);
        setPopulatedSuccess(`Loaded ${fetched.length} channels from ${dir.name}!`);
        setTimeout(() => setPopulatedSuccess(null), 3500);
      }
    } catch (err) {
      console.error('Error fetching directory playlist:', err);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  const handleChannelClick = (channel: ChannelItem) => {
    const mediaItem: MediaItem = {
      id: channel.id,
      title: channel.name,
      description: channel.epgDescription || channel.currentProgram || '24/7 Live Stream broadcast.',
      type: 'live',
      source: 'iptv',
      genres: ['Live TV', channel.category || 'General'],
      posterUrl: channel.logoUrl || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=500&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      streamUrl: channel.streamUrl,
      streamType: 'hls',
      year: new Date().getFullYear(),
      duration: 'Live',
      rating: 'Live',
      isPublicDomain: false,
    };
    onPlayChannel(mediaItem);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Responsive for Mobile, Tablet & Large Screens */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30">
        <div>
          <div className="flex items-center space-x-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Live TV Guide ({allChannels.length} Channels Available)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Global TV, Kids Zone & IPTV Directories</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Stream free-to-air channels, Nigerian broadcasts, Kid Zones, cartoons, tech, science, and playlists from iptv-org & free-tv.
          </p>
        </div>

        <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 w-full md:w-auto justify-end">
          {onOpenMultiView && (
            <button
              onClick={onOpenMultiView}
              className="tv-focusable flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-cyan-600/25 transition-all hover:scale-105"
              title="Watch multiple live channels at once"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Multi-View TV</span>
            </button>
          )}

          <button
            onClick={onOpenImportM3U}
            className="tv-focusable flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-all hover:scale-105"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Import M3U</span>
          </button>
        </div>
      </div>

      {/* Directory Mode Switcher (Tablet & Mobile Optimized) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
          <button
            onClick={() => {
              setActiveTab('countries');
              setSelectedCategory('All');
            }}
            className={`tv-focusable flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'countries'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Countries & Nigeria 🇳🇬</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('categories');
              setSelectedCategory('All');
            }}
            className={`tv-focusable flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>IPTV-org Categories</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-400 text-slate-900 font-extrabold uppercase">Repo</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('freetv');
              setSelectedCategory('All');
            }}
            className={`tv-focusable flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'freetv'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Free-TV Directory</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-400 text-slate-900 font-extrabold uppercase">2000+</span>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-2">
          {isLoadingDirectory && (
            <span className="text-xs text-sky-400 flex items-center space-x-1.5 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching IPTV playlist...</span>
            </span>
          )}
          {populatedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center space-x-1.5 animate-fade-in font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{populatedSuccess}</span>
            </span>
          )}
        </div>
      </div>

      {/* Mode A: Country Selector Carousel / Pills */}
      {activeTab === 'countries' && !isSearching && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Select Country</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => handleCountrySelect('all')}
              className={`tv-focusable px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                selectedCountry === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300'
              }`}
            >
              <span>🌍 All Global</span>
            </button>

            {WORLD_COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country.code)}
                className={`tv-focusable px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  selectedCountry === country.code
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300'
                }`}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode B: IPTV-org Categories Explorer */}
      {activeTab === 'categories' && !isSearching && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>IPTV-org Categories (Click to Load)</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {iptvOrgDirectories.map((dir) => (
              <button
                key={dir.id}
                onClick={() => handleDirectorySelect(dir.id)}
                className={`tv-focusable px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  selectedDirectory === dir.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700/60'
                }`}
              >
                <span>{dir.icon}</span>
                <span>{dir.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode C: Free-TV Directory Explorer */}
      {activeTab === 'freetv' && !isSearching && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Free-TV Playlists (github.com/free-tv/iptv)</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {freetvDirectories.map((dir) => (
              <button
                key={dir.id}
                onClick={() => handleDirectorySelect(dir.id)}
                className={`tv-focusable px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  selectedDirectory === dir.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700/60'
                }`}
              >
                <span>{dir.icon}</span>
                <span>{dir.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input with Clear Button */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels, cartoons, kids, tech, sports, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills (Hidden while user is searching globally) */}
        {!isSearching && (
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`tv-focusable px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-slate-700 text-white border border-slate-500 shadow'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-gray-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="text-xs text-gray-400 py-1">
            Found <span className="text-white font-bold">{filteredChannels.length}</span> channels for "{searchQuery}"
          </div>
        )}
      </div>

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 font-semibold">View Mode:</span>
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`tv-focusable px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Channel Cards</span>
            </button>
            <button
              onClick={() => setViewMode('epg')}
              className={`tv-focusable px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'epg'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Live EPG Schedule</span>
            </button>
          </div>
        </div>

        <span className="text-xs text-gray-400 hidden sm:inline">
          Showing <strong className="text-white">{filteredChannels.length}</strong> stations
        </span>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'grid' ? (
        /* Channel Grid - Tablet Responsive (1 col on mobile, 2 col on tablet, 3-4 col on desktop) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => handleChannelClick(channel)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleChannelClick(channel);
                }
              }}
              tabIndex={0}
              role="button"
              className="tv-focusable group flex items-center justify-between p-3.5 md:p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 transition-all duration-200 cursor-pointer hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-red-500/10"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                {/* Channel Logo */}
                <div className="relative w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700/60 flex-shrink-0 group-hover:scale-105 transition-transform">
                  {channel.logoUrl ? (
                    <img
                      src={channel.logoUrl}
                      alt={channel.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Tv className="w-6 h-6 text-gray-400" />
                  )}
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>

                {/* Title & Info */}
                <div className="overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-100 group-hover:text-red-400 transition-colors truncate">
                      {channel.name}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-sky-400 font-medium truncate mt-0.5">
                    {channel.currentProgram || 'Live Broadcasting'}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-1 text-[10px] sm:text-[11px] text-gray-400">
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-gray-300 border border-slate-700/50">
                      {channel.category || 'General'}
                    </span>
                    {channel.country && <span className="truncate">{channel.country}</span>}
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-red-600/20 group-hover:bg-red-600 text-red-400 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-all ml-2">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EPG Timeline Schedule List */
        <div className="space-y-3">
          {filteredChannels.map((channel, idx) => {
            const epg = epgService.getProgramForChannel(channel);
            const channelNumber = 101 + idx;

            return (
              <div
                key={`epg-${channel.id}`}
                onClick={() => handleChannelClick(channel)}
                className="tv-focusable group p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-red-500/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Channel Header & Number */}
                  <div className="flex items-center space-x-3.5 min-w-[220px]">
                    <span className="text-xs font-mono font-bold text-gray-400 bg-slate-800 px-2 py-1 rounded-lg shrink-0">
                      CH {channelNumber}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700/60 shrink-0">
                      {channel.logoUrl ? (
                        <img
                          src={channel.logoUrl}
                          alt={channel.name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Tv className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors truncate">
                        {channel.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 mt-0.5 text-[11px] text-gray-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-gray-300">
                          {channel.category || 'Live TV'}
                        </span>
                        {channel.country && <span className="truncate">{channel.country}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Now Playing Program + Live Progress Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                        <strong className="text-white truncate">{epg.current.title}</strong>
                        <span className="text-gray-400 font-mono text-[11px]">
                          ({epg.current.start} - {epg.current.end})
                        </span>
                      </div>
                      <span className="text-emerald-400 font-medium text-[11px] shrink-0 ml-2">
                        {epg.current.remainingMinutes}m left
                      </span>
                    </div>

                    {/* Live Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-500"
                        style={{ width: `${epg.current.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <p className="truncate max-w-md">{epg.current.description}</p>
                      <span className="text-gray-500 truncate hidden lg:inline ml-3">
                        Next: <span className="text-gray-300">{epg.upNext.title}</span> at {epg.upNext.start}
                      </span>
                    </div>
                  </div>

                  {/* Tune In Button */}
                  <div className="flex items-center justify-end shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChannelClick(channel);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-600/20 group-hover:bg-red-600 text-red-300 group-hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Tune In</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredChannels.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-300">No channels match your criteria</h3>
          <p className="text-xs text-gray-400 mt-1">Try another search term or click on "All Global" or "Free-TV Directory".</p>
        </div>
      )}
    </div>
  );
};
