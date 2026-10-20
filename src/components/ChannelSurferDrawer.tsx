import React from 'react';
import { X, Tv, Radio, ChevronRight } from 'lucide-react';
import { ChannelItem, MediaItem } from '../types';

interface ChannelSurferDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  channels: ChannelItem[];
  activeChannelUrl: string;
  onSwitchChannel: (media: MediaItem) => void;
}

export const ChannelSurferDrawer: React.FC<ChannelSurferDrawerProps> = ({
  isOpen,
  onClose,
  channels,
  activeChannelUrl,
  onSwitchChannel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 z-40 w-full max-w-sm glass-panel border-l border-slate-700/80 p-5 flex flex-col shadow-2xl animate-slide-left pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-red-500 font-bold text-xs uppercase tracking-wider">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Quick Channel Surfer</span>
        </div>
        <button
          onClick={onClose}
          className="tv-focusable p-1.5 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white"
          title="Close Surfer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-2">
        {channels.map((channel) => {
          const isActive = channel.streamUrl === activeChannelUrl;

          return (
            <div
              key={channel.id}
              onClick={() => {
                onSwitchChannel({
                  id: channel.id,
                  title: channel.name,
                  description: channel.epgDescription || '24/7 Live Broadcast Feed',
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
                });
              }}
              tabIndex={0}
              className={`tv-focusable flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-red-600/30 border border-red-500/60 text-white shadow-md'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-gray-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-700">
                  {channel.logoUrl ? (
                    <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-cover" />
                  ) : (
                    <Tv className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-xs text-white truncate">{channel.name}</h4>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-sky-400 truncate mt-0.5">
                    {channel.currentProgram || channel.category}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
