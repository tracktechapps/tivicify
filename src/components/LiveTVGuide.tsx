import React, { useState } from 'react';
import { 
  Radio, 
  Play, 
  Tv, 
  FolderPlus, 
  Globe, 
  Search, 
  Loader2, 
  DownloadCloud,
  CheckCircle2
} from 'lucide-react';
import { ChannelItem, MediaItem } from '../types';
import { WORLD_COUNTRIES, worldTvService } from '../services/worldTvService';

interface LiveTVGuideProps {
  channels: ChannelItem[];
  customChannels: ChannelItem[];
  onPlayChannel: (media: MediaItem) => void;
  onOpenImportM3U: () => void;
  onChannelsPopulated?: (newChannels: ChannelItem[]) => void;
}

export const LiveTVGuide: React.FC<LiveTVGuideProps> = ({
  channels,
  customChannels,
  onPlayChannel,
  onOpenImportM3U,
  onChannelsPopulated,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingCountry, setIsLoadingCountry] = useState<boolean>(false);
  const [populatedSuccess, setPopulatedSuccess] = useState<string | null>(null);

  const allChannels = [...channels, ...customChannels];

  // Extract unique categories
  const categories = ['All', 'News', 'Sports', 'Movies', 'Animation', 'Music', 'Science', 'Entertainment'];

  // Filter channels by Country, Category, and Search Query
  const filteredChannels = allChannels.filter((ch) => {
    // Country filter
    if (selectedCountry !== 'all') {
      const countryConfig = WORLD_COUNTRIES.find((c) => c.code === selectedCountry);
      if (countryConfig && ch.country && !ch.country.toLowerCase().includes(countryConfig.name.toLowerCase()) && !ch.country.includes(countryConfig.flag)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'All' && ch.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = ch.name.toLowerCase().includes(q);
      const matchCat = ch.category.toLowerCase().includes(q);
      const matchProg = ch.currentProgram?.toLowerCase().includes(q);
      const matchCountry = ch.country?.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchProg && !matchCountry) return false;
    }

    return true;
  });

  const handleCountrySelect = async (countryCode: string) => {
    setSelectedCountry(countryCode);
    if (countryCode === 'all') return;

    // Check if we need to fetch channels for this country
    const country = WORLD_COUNTRIES.find((c) => c.code === countryCode);
    if (!country) return;

    const existingForCountry = allChannels.filter(
      (c) => c.country && (c.country.includes(country.flag) || c.country.toLowerCase().includes(country.name.toLowerCase()))
    );

    if (existingForCountry.length < 5) {
      setIsLoadingCountry(true);
      try {
        const fetched = await worldTvService.fetchCountryChannels(countryCode);
        if (fetched.length > 0 && onChannelsPopulated) {
          onChannelsPopulated(fetched);
          setPopulatedSuccess(`Loaded ${fetched.length} live channels from ${country.name}!`);
          setTimeout(() => setPopulatedSuccess(null), 3000);
        }
      } catch (err) {
        console.error('Error fetching country channels:', err);
      } finally {
        setIsLoadingCountry(false);
      }
    }
  };

  const handleChannelClick = (channel: ChannelItem) => {
    const mediaItem: MediaItem = {
      id: channel.id,
      title: channel.name,
      description: channel.epgDescription || channel.currentProgram || '24/7 Live Stream broadcast.',
      type: 'live',
      source: 'iptv',
      genres: ['Live TV', channel.category],
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30">
        <div>
          <div className="flex items-center space-x-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>World Live TV Channels ({allChannels.length} Channels Online)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Global TV Electronic Program Guide</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Stream free-to-air broadcasts, news, sports, and entertainment channels from countries around the world.
          </p>
        </div>

        <button
          onClick={onOpenImportM3U}
          className="tv-focusable flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 text-sm font-semibold transition-all hover:scale-105"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Import Custom M3U</span>
        </button>
      </div>

      {/* Country Selector Carousel / Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Select Country / Region</span>
          </span>
          {isLoadingCountry && (
            <span className="text-xs text-sky-400 flex items-center space-x-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Populating live channels...</span>
            </span>
          )}
          {populatedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center space-x-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{populatedSuccess}</span>
            </span>
          )}
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

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search channel name, country, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Category Pills */}
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
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            className="tv-focusable group flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 transition-all duration-200 cursor-pointer hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-red-500/10"
          >
            <div className="flex items-center space-x-3.5 overflow-hidden">
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

              {/* Title & EPG Info */}
              <div className="overflow-hidden">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-gray-100 group-hover:text-red-400 transition-colors truncate">
                    {channel.name}
                  </h3>
                </div>
                <p className="text-xs text-sky-400 font-medium truncate mt-0.5">
                  {channel.currentProgram || 'Live Broadcasting'}
                </p>
                <div className="flex items-center space-x-2 mt-1 text-[11px] text-gray-400">
                  <span className="px-1.5 py-0.2 bg-slate-800 rounded text-gray-400 border border-slate-700/50">
                    {channel.category}
                  </span>
                  {channel.country && <span className="truncate">{channel.country}</span>}
                </div>
              </div>
            </div>

            {/* Play Button */}
            <div className="w-9 h-9 rounded-full bg-red-600/20 group-hover:bg-red-600 text-red-400 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-all ml-2">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-300">No channels match your criteria</h3>
          <p className="text-xs text-gray-400 mt-1">Select another country flag or click "All Global" to view channels.</p>
        </div>
      )}
    </div>
  );
};
