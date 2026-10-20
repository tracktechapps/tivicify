import React, { useState } from 'react';
import { Radio, Play, Tv, FolderPlus, Globe, Sparkles } from 'lucide-react';
import { ChannelItem, MediaItem } from '../types';

interface LiveTVGuideProps {
  channels: ChannelItem[];
  customChannels: ChannelItem[];
  onPlayChannel: (media: MediaItem) => void;
  onOpenImportM3U: () => void;
}

export const LiveTVGuide: React.FC<LiveTVGuideProps> = ({
  channels,
  customChannels,
  onPlayChannel,
  onOpenImportM3U,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredChannel, setHoveredChannel] = useState<ChannelItem | null>(null);

  const allChannels = [...channels, ...customChannels];

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(allChannels.map((c) => c.category)))];

  const filteredChannels =
    selectedCategory === 'All'
      ? allChannels
      : allChannels.filter((c) => c.category === selectedCategory);

  const activeChannel = hoveredChannel || filteredChannels[0];

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
            <span>24/7 Free-to-Air & IPTV Broadcasts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Live TV Electronic Program Guide</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Stream official news feeds, science broadcasts, sports tournaments, and custom imported IPTV channels legal & free worldwide.
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

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`tv-focusable px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel, index) => (
          <div
            key={channel.id}
            onClick={() => handleChannelClick(channel)}
            onMouseEnter={() => setHoveredChannel(channel)}
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
              {/* Channel Logo / Icon */}
              <div className="relative w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700/60 flex-shrink-0 group-hover:scale-105 transition-transform">
                {channel.logoUrl ? (
                  <img
                    src={channel.logoUrl}
                    alt={channel.name}
                    className="w-full h-full object-cover"
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
                  {channel.country && <span>{channel.country}</span>}
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
          <h3 className="text-lg font-bold text-gray-300">No channels in this category</h3>
          <p className="text-xs text-gray-400 mt-1">Import an M3U playlist to add hundreds of custom live channels.</p>
        </div>
      )}
    </div>
  );
};
