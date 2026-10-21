import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { 
  LayoutGrid, 
  Columns, 
  Volume2, 
  VolumeX, 
  Maximize, 
  X, 
  Tv, 
  RefreshCw, 
  Sparkles,
  ChevronDown,
  Radio
} from 'lucide-react';
import { ChannelItem, MediaItem } from '../types';

interface MultiViewPlayerProps {
  channels: ChannelItem[];
  onClose: () => void;
  onMaximizeChannel: (media: MediaItem) => void;
}

interface TileState {
  id: string;
  channel: ChannelItem;
}

export const MultiViewPlayer: React.FC<MultiViewPlayerProps> = ({
  channels,
  onClose,
  onMaximizeChannel,
}) => {
  // 'dual' = 2 screens, 'quad' = 4 screens
  const [layout, setLayout] = useState<'dual' | 'quad'>('quad');
  
  // Which tile has audio focus (0, 1, 2, or 3)
  const [activeAudioIndex, setActiveAudioIndex] = useState<number>(0);
  const [isMutedAll, setIsMutedAll] = useState(false);

  // Active channel assigned to each of the 4 slots
  const [slots, setSlots] = useState<ChannelItem[]>(() => {
    // Provide sensible diverse defaults
    const defaults: ChannelItem[] = [];
    if (channels.length > 0) defaults.push(channels[0]);
    if (channels.length > 1) defaults.push(channels[1]);
    if (channels.length > 2) defaults.push(channels[2]);
    if (channels.length > 3) defaults.push(channels[3]);

    // Fallbacks if fewer channels
    while (defaults.length < 4 && channels.length > 0) {
      defaults.push(channels[defaults.length % channels.length]);
    }
    return defaults;
  });

  // Track video elements refs
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);
  const hlsRefs = useRef<(Hls | null)[]>([null, null, null, null]);

  // Handle slot channel selection
  const handleSelectChannelForSlot = (slotIndex: number, channelId: string) => {
    const ch = channels.find((c) => c.id === channelId);
    if (!ch) return;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = ch;
      return next;
    });
  };

  // Setup HLS for each slot
  const setupStreamForSlot = (index: number) => {
    const video = videoRefs.current[index];
    const channel = slots[index];
    if (!video || !channel) return;

    // Destroy old HLS instance
    if (hlsRefs.current[index]) {
      hlsRefs.current[index]?.destroy();
      hlsRefs.current[index] = null;
    }

    const streamUrl = channel.streamUrl;
    const isHls = streamUrl.includes('.m3u8') || streamUrl.includes('cmaf');

    if (Hls.isSupported() && isHls) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 30,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });

      hlsRefs.current[index] = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHls) {
      video.src = streamUrl;
      video.play().catch(() => {});
    }

    // Set muted status
    video.muted = isMutedAll || activeAudioIndex !== index;
  };

  // Effect to re-sync streams when slots or layout change
  useEffect(() => {
    const count = layout === 'dual' ? 2 : 4;
    for (let i = 0; i < count; i++) {
      setupStreamForSlot(i);
    }

    return () => {
      hlsRefs.current.forEach((hls) => hls?.destroy());
      hlsRefs.current = [null, null, null, null];
    };
  }, [slots, layout]);

  // Audio focus switching effect
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        video.muted = isMutedAll || idx !== activeAudioIndex;
      }
    });
  }, [activeAudioIndex, isMutedAll]);

  // Preset switchers
  const applyPreset = (presetName: 'news' | 'kids' | 'tech' | 'nigeria') => {
    let filtered: ChannelItem[] = [];
    if (presetName === 'news') {
      filtered = channels.filter((c) => (c.category || '').toLowerCase().includes('news') || (c.name || '').toLowerCase().includes('news'));
    } else if (presetName === 'kids') {
      filtered = channels.filter((c) => 
        (c.category || '').toLowerCase().includes('kid') || 
        (c.category || '').toLowerCase().includes('animation') || 
        (c.name || '').toLowerCase().includes('cartoon')
      );
    } else if (presetName === 'tech') {
      filtered = channels.filter((c) => 
        (c.category || '').toLowerCase().includes('tech') || 
        (c.category || '').toLowerCase().includes('science') || 
        (c.name || '').toLowerCase().includes('discovery') ||
        (c.name || '').toLowerCase().includes('nasa')
      );
    } else if (presetName === 'nigeria') {
      filtered = channels.filter((c) => (c.country || '').includes('Nigeria') || (c.name || '').toLowerCase().includes('channels') || (c.name || '').toLowerCase().includes('tvc'));
    }

    if (filtered.length >= 2) {
      setSlots((prev) => {
        const next = [...prev];
        for (let i = 0; i < 4; i++) {
          if (filtered[i]) next[i] = filtered[i];
        }
        return next;
      });
    }
  };

  const handleMaximize = (slotIndex: number) => {
    const ch = slots[slotIndex];
    if (!ch) return;
    const media: MediaItem = {
      id: ch.id,
      title: ch.name,
      description: ch.currentProgram || `Live TV channel in ${ch.category || 'General'}`,
      type: 'live',
      source: 'iptv',
      genres: [ch.category || 'Live TV'],
      posterUrl: ch.logoUrl || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
      backdropUrl: ch.logoUrl || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&auto=format&fit=crop&q=80',
      streamUrl: ch.streamUrl,
      streamType: 'hls',
      year: new Date().getFullYear(),
    };
    onMaximizeChannel(media);
  };

  const activeSlots = layout === 'dual' ? slots.slice(0, 2) : slots.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in select-none">
      
      {/* Top Multi-View Toolbar */}
      <header className="px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Multi-View Live TV</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {layout === 'dual' ? 'Dual Screen (2x1)' : 'Quad Screen (2x2)'}
              </span>
            </h1>
            <p className="text-[11px] text-gray-400">
              Tap any screen to switch live audio focus
            </p>
          </div>
        </div>

        {/* Preset Category Switchers */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider px-2">Presets:</span>
          <button
            onClick={() => applyPreset('news')}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-gray-200 transition-colors"
          >
            News Mix
          </button>
          <button
            onClick={() => applyPreset('kids')}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-emerald-300 transition-colors"
          >
            Kids Zone
          </button>
          <button
            onClick={() => applyPreset('tech')}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-cyan-300 transition-colors"
          >
            Science & Tech
          </button>
          <button
            onClick={() => applyPreset('nigeria')}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-amber-300 transition-colors"
          >
            Nigeria 🇳🇬
          </button>
        </div>

        {/* View Controls & Close */}
        <div className="flex items-center space-x-2">
          {/* Dual / Quad Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setLayout('dual')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                layout === 'dual' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Dual Screen (2 screens)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual</span>
            </button>
            <button
              onClick={() => setLayout('quad')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                layout === 'quad' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Quad Screen (4 screens)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Quad</span>
            </button>
          </div>

          {/* Master Mute Toggle */}
          <button
            onClick={() => setIsMutedAll(!isMutedAll)}
            className={`p-2 rounded-xl text-xs font-semibold transition-colors border ${
              isMutedAll 
                ? 'bg-rose-600/20 text-rose-300 border-rose-500/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border-slate-700'
            }`}
            title={isMutedAll ? 'Unmute Audio' : 'Mute All Screens'}
          >
            {isMutedAll ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Close Multi-View */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
            title="Exit Multi-View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Multi-View Grid Video Canvas */}
      <div className={`flex-1 p-2 sm:p-3 grid gap-2 sm:gap-3 bg-black min-h-0 ${
        layout === 'dual' 
          ? 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1' 
          : 'grid-cols-1 sm:grid-cols-2 grid-rows-4 sm:grid-rows-2'
      }`}>
        {activeSlots.map((ch, idx) => {
          const isFocused = activeAudioIndex === idx && !isMutedAll;

          return (
            <div
              key={`slot-${idx}-${ch.id}`}
              onClick={() => setActiveAudioIndex(idx)}
              className={`relative rounded-xl overflow-hidden bg-slate-950 flex flex-col group cursor-pointer transition-all duration-300 ring-2 ${
                isFocused 
                  ? 'ring-cyan-400 shadow-xl shadow-cyan-500/20' 
                  : 'ring-slate-800/80 hover:ring-slate-600'
              }`}
            >
              {/* Video Element */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                  }}
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain"
                />

                {/* Audio Focus Glow Overlay Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-2 z-10 pointer-events-none">
                  {isFocused ? (
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-cyan-500/40 animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/60 text-gray-400 text-[10px] font-medium backdrop-blur-sm">
                      <VolumeX className="w-3 h-3" />
                      <span>Muted</span>
                    </div>
                  )}
                </div>

                {/* Quick Maximize Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMaximize(idx);
                  }}
                  className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-blue-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
                  title="Expand to Fullscreen Player"
                >
                  <Maximize className="w-4 h-4" />
                </button>

                {/* Reload Stream button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setupStreamForSlot(idx);
                  }}
                  className="absolute bottom-2.5 left-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-700 text-gray-300 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="Reload stream"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Tile Bar: Channel Selector Dropdown & Info */}
              <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0 z-20">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
                  
                  {/* Channel Dropdown Picker */}
                  <div className="relative flex-1 min-w-0">
                    <select
                      value={ch.id}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleSelectChannelForSlot(idx, e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white truncate focus:outline-none cursor-pointer pr-4 appearance-none"
                    >
                      {channels.map((channelOption) => (
                        <option
                          key={channelOption.id}
                          value={channelOption.id}
                          className="bg-slate-900 text-white py-1"
                        >
                          {channelOption.name} ({channelOption.category || 'Live'})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                    CH {idx + 1}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAudioIndex(idx);
                      setIsMutedAll(false);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isFocused ? 'text-cyan-400 bg-cyan-500/20' : 'text-gray-400 hover:text-white'
                    }`}
                    title="Listen to this channel"
                  >
                    {isFocused ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
