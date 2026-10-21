import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { 
  LayoutGrid, 
  Columns, 
  Maximize2,
  Volume2, 
  VolumeX, 
  Maximize, 
  X, 
  Tv, 
  RefreshCw, 
  Sparkles,
  ChevronDown,
  Search,
  Check,
  Radio,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { ChannelItem, MediaItem } from '../types';

interface MultiViewPlayerProps {
  channels: ChannelItem[];
  onClose: () => void;
  onMaximizeChannel: (media: MediaItem) => void;
}

export const MultiViewPlayer: React.FC<MultiViewPlayerProps> = ({
  channels,
  onClose,
  onMaximizeChannel,
}) => {
  // Layouts: 'focus' (1 Big + 3 Mini), 'dual' (2 screens), 'quad' (4 screens)
  const [layout, setLayout] = useState<'focus' | 'dual' | 'quad'>('quad');
  
  // Which slot has primary audio focus
  const [activeAudioIndex, setActiveAudioIndex] = useState<number>(0);
  // Which slot is the big screen in 'focus' mode
  const [primaryFocusIndex, setPrimaryFocusIndex] = useState<number>(0);
  const [isMutedAll, setIsMutedAll] = useState(false);

  // Modal channel picker state: which slot (0, 1, 2, or 3) are we picking a channel for
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  // Active channel assigned to each of the 4 slots
  const [slots, setSlots] = useState<ChannelItem[]>(() => {
    const defaults: ChannelItem[] = [];
    if (channels.length > 0) defaults.push(channels[0]);
    if (channels.length > 1) defaults.push(channels[1]);
    if (channels.length > 2) defaults.push(channels[2]);
    if (channels.length > 3) defaults.push(channels[3]);

    while (defaults.length < 4 && channels.length > 0) {
      defaults.push(channels[defaults.length % channels.length]);
    }
    return defaults;
  });

  // Track video elements refs
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);
  const hlsRefs = useRef<(Hls | null)[]>([null, null, null, null]);

  // Handle slot channel selection
  const handleSelectChannelForSlot = (slotIndex: number, channel: ChannelItem) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = channel;
      return next;
    });
    setPickerSlotIndex(null);
  };

  // Setup HLS for each slot
  const setupStreamForSlot = (index: number) => {
    const video = videoRefs.current[index];
    const channel = slots[index];
    if (!video || !channel) return;

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

    video.muted = isMutedAll || activeAudioIndex !== index;
  };

  // Re-sync streams when slots or layout change
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

  // Category Presets
  const applyPreset = (presetName: 'news' | 'kids' | 'tech' | 'nigeria' | 'sports') => {
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
    } else if (presetName === 'sports') {
      filtered = channels.filter((c) => 
        (c.category || '').toLowerCase().includes('sport') || 
        (c.name || '').toLowerCase().includes('sport') || 
        (c.name || '').toLowerCase().includes('fifa') ||
        (c.name || '').toLowerCase().includes('red bull')
      );
    } else if (presetName === 'nigeria') {
      filtered = channels.filter((c) => 
        (c.country || '').includes('Nigeria') || 
        (c.name || '').toLowerCase().includes('arise') || 
        (c.name || '').toLowerCase().includes('ait') || 
        (c.name || '').toLowerCase().includes('channels') || 
        (c.name || '').toLowerCase().includes('tvc') || 
        (c.name || '').toLowerCase().includes('ontv') || 
        (c.name || '').toLowerCase().includes('rave') || 
        (c.name || '').toLowerCase().includes('magic')
      );
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

  // Filter channels for the picker modal
  const pickerCategories = ['All', 'Nigeria 🇳🇬', 'News', 'Sports', 'Kids', 'Movies', 'Tech', 'Music', 'Entertainment'];

  const filteredPickerChannels = channels.filter((ch) => {
    const matchSearch = pickerSearch.trim() === '' || 
      (ch.name || '').toLowerCase().includes(pickerSearch.toLowerCase().trim()) ||
      (ch.category || '').toLowerCase().includes(pickerSearch.toLowerCase().trim()) ||
      (ch.country || '').toLowerCase().includes(pickerSearch.toLowerCase().trim());

    if (!matchSearch) return false;

    if (pickerCategory === 'Nigeria 🇳🇬') {
      return (ch.country || '').includes('Nigeria') || (ch.name || '').toLowerCase().includes('arise') || (ch.name || '').toLowerCase().includes('ait') || (ch.name || '').toLowerCase().includes('channels') || (ch.name || '').toLowerCase().includes('tvc') || (ch.name || '').toLowerCase().includes('ontv') || (ch.name || '').toLowerCase().includes('rave');
    }
    if (pickerCategory !== 'All') {
      return (ch.category || '').toLowerCase().includes(pickerCategory.toLowerCase());
    }
    return true;
  });

  const activeSlots = layout === 'dual' ? slots.slice(0, 2) : slots.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in select-none">
      
      {/* Top Multi-View Toolbar */}
      <header className="px-3 sm:px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Multi-View Live TV</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {layout === 'focus' ? 'Spotlight (1 Big + 3)' : layout === 'dual' ? 'Dual (2x1)' : 'Quad (2x2)'}
              </span>
            </h1>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Click any screen to listen • Tap "Change Station" to pick any channel
            </p>
          </div>
        </div>

        {/* Screen Quick Toggles Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {activeSlots.map((ch, idx) => (
            <button
              key={`quick-screen-${idx}`}
              onClick={() => {
                setActiveAudioIndex(idx);
                if (layout === 'focus') setPrimaryFocusIndex(idx);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 border ${
                activeAudioIndex === idx
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                  : 'bg-slate-800/80 text-gray-300 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="font-bold">Screen {idx + 1}:</span>
              <span className="truncate max-w-[100px] text-[11px]">{ch.name}</span>
            </button>
          ))}
        </div>

        {/* Layout Modes & Preset Controls */}
        <div className="flex items-center space-x-2">
          
          {/* Layout Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setLayout('focus')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                layout === 'focus' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Spotlight: 1 Main Big Screen + 3 Small Screens"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Spotlight</span>
            </button>
            <button
              onClick={() => setLayout('dual')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                layout === 'dual' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Dual Screen (2 screens)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dual</span>
            </button>
            <button
              onClick={() => setLayout('quad')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                layout === 'quad' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Quad Screen (4 screens)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quad</span>
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

      {/* Preset Category Switcher Bar */}
      <div className="px-4 py-1.5 bg-slate-950 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Quick Groups:</span>
        <button
          onClick={() => applyPreset('nigeria')}
          className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/30 transition-colors"
        >
          Nigeria Top 4 🇳🇬 (Arise, AIT, Channels, TVC)
        </button>
        <button
          onClick={() => applyPreset('sports')}
          className="px-2.5 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/30 transition-colors"
        >
          Sports Action ⚽ (SuperSport, FIFA, Red Bull)
        </button>
        <button
          onClick={() => applyPreset('news')}
          className="px-2.5 py-0.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 font-semibold border border-blue-500/30 transition-colors"
        >
          World News 🌍
        </button>
        <button
          onClick={() => applyPreset('kids')}
          className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors"
        >
          Kids Zone 👶
        </button>
        <button
          onClick={() => applyPreset('tech')}
          className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/30 transition-colors"
        >
          Science & Tech 🔬
        </button>
      </div>

      {/* Video Canvas Container */}
      <div className="flex-1 p-2 sm:p-3 bg-black min-h-0 overflow-hidden">
        
        {/* ================= LAYOUT 1: SPOTLIGHT / FOCUS (1 Big + 3 Mini) ================= */}
        {layout === 'focus' && (
          <div className="w-full h-full flex flex-col lg:flex-row gap-2 sm:gap-3">
            {/* Main Big Screen */}
            <div
              onClick={() => setActiveAudioIndex(primaryFocusIndex)}
              className={`flex-1 relative rounded-2xl overflow-hidden bg-slate-950 flex flex-col group cursor-pointer ring-2 ${
                activeAudioIndex === primaryFocusIndex && !isMutedAll
                  ? 'ring-cyan-400 shadow-2xl shadow-cyan-500/25'
                  : 'ring-slate-800 hover:ring-slate-600'
              }`}
            >
              {/* Video Element */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={(el) => {
                    videoRefs.current[primaryFocusIndex] = el;
                  }}
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain"
                />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center space-x-2 z-10 pointer-events-none">
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow">
                    <span>Main Screen {primaryFocusIndex + 1}</span>
                  </div>
                  {activeAudioIndex === primaryFocusIndex && !isMutedAll ? (
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/40 animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 text-gray-300 text-xs font-medium backdrop-blur-sm">
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Muted</span>
                    </div>
                  )}
                </div>

                {/* Hover Buttons */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPickerSlotIndex(primaryFocusIndex);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Change Station</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMaximize(primaryFocusIndex);
                    }}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-blue-600 text-white backdrop-blur-md"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Tile Info & Select Button */}
              <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-white truncate">{slots[primaryFocusIndex]?.name}</h3>
                    <p className="text-[11px] text-sky-400 truncate">{slots[primaryFocusIndex]?.currentProgram || 'Live Stream'}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPickerSlotIndex(primaryFocusIndex);
                  }}
                  className="tv-focusable px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-gray-200 hover:text-white text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition-colors shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Select Channel</span>
                </button>
              </div>
            </div>

            {/* Sidebar of 3 Compact Thumbnail Screens */}
            <div className="w-full lg:w-72 xl:w-80 flex flex-row lg:flex-col gap-2 shrink-0">
              {[0, 1, 2, 3].filter((idx) => idx !== primaryFocusIndex).map((slotIdx) => {
                const ch = slots[slotIdx];
                const isFocused = activeAudioIndex === slotIdx && !isMutedAll;

                return (
                  <div
                    key={`mini-slot-${slotIdx}`}
                    onClick={() => {
                      setActiveAudioIndex(slotIdx);
                      setPrimaryFocusIndex(slotIdx);
                    }}
                    className={`flex-1 relative rounded-xl overflow-hidden bg-slate-950 flex flex-col group cursor-pointer ring-2 transition-all ${
                      isFocused ? 'ring-cyan-400' : 'ring-slate-800 hover:ring-slate-600'
                    }`}
                  >
                    <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[90px]">
                      <video
                        ref={(el) => {
                          videoRefs.current[slotIdx] = el;
                        }}
                        playsInline
                        autoPlay
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      
                      <div className="absolute top-1.5 left-1.5 flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 rounded bg-black/70 text-gray-200 text-[10px] font-bold">
                          CH {slotIdx + 1}
                        </span>
                        {isFocused && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-black text-[10px] font-black uppercase">
                            Audio
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPickerSlotIndex(slotIdx);
                        }}
                        className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Swap
                      </button>
                    </div>

                    <div className="px-2 py-1 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-gray-200 font-bold truncate">{ch?.name}</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= LAYOUT 2 & 3: DUAL (2x1) & QUAD (2x2) GRIDS ================= */}
        {layout !== 'focus' && (
          <div className={`w-full h-full grid gap-2 sm:gap-3 ${
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
                  {/* Video Element Canvas */}
                  <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                    <video
                      ref={(el) => {
                        videoRefs.current[idx] = el;
                      }}
                      playsInline
                      autoPlay
                      className="w-full h-full object-contain"
                    />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center space-x-2 z-10 pointer-events-none">
                      <div className="px-2 py-0.5 rounded-md bg-slate-900/80 text-gray-200 text-[10px] font-bold border border-slate-700">
                        Screen {idx + 1}
                      </div>

                      {isFocused ? (
                        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-cyan-500/40 animate-pulse">
                          <Volume2 className="w-3 h-3" />
                          <span>Audio Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/60 text-gray-400 text-[10px] font-medium backdrop-blur-sm">
                          <VolumeX className="w-3 h-3" />
                          <span>Muted</span>
                        </div>
                      )}
                    </div>

                    {/* Center "Change Station" Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPickerSlotIndex(idx);
                        }}
                        className="pointer-events-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-2xl transition-all hover:scale-105"
                      >
                        <Search className="w-4 h-4" />
                        <span>Select Channel for Screen {idx + 1}</span>
                      </button>
                    </div>

                    {/* Quick Maximize & Reload Buttons */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-all z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setupStreamForSlot(idx);
                        }}
                        className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-700 text-gray-300 backdrop-blur-md"
                        title="Reload stream"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMaximize(idx);
                        }}
                        className="p-2 rounded-xl bg-slate-900/80 hover:bg-blue-600 text-white backdrop-blur-md"
                        title="Expand to Fullscreen Player"
                      >
                        <Maximize className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Tile Bar: Channel Name & Quick Selector */}
                  <div className="px-3 py-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0 z-20">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{ch.name}</span>
                        <span className="text-[10px] text-sky-400 block truncate">{ch.category || 'Live TV'}</span>
                      </div>
                    </div>

                    {/* Change Station Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPickerSlotIndex(idx);
                      }}
                      className="tv-focusable px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-gray-300 hover:text-white text-[11px] font-bold flex items-center space-x-1 transition-colors border border-slate-700 shrink-0"
                    >
                      <Tv className="w-3 h-3 text-cyan-400" />
                      <span>Change</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL: CHANNEL SELECTOR MODAL ================= */}
      {pickerSlotIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Select Station for Screen {pickerSlotIndex + 1}</span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Currently playing: <strong className="text-cyan-400">{slots[pickerSlotIndex]?.name}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPickerSlotIndex(null)}
                className="p-2 rounded-full bg-slate-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search station name, country, or category..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              {pickerSearch && (
                <button
                  onClick={() => setPickerSearch('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-3 mb-2 shrink-0">
              {pickerCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPickerCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    pickerCategory === cat
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Channel List Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredPickerChannels.map((channel) => {
                const isCurrent = slots[pickerSlotIndex]?.id === channel.id;

                return (
                  <button
                    key={channel.id}
                    onClick={() => handleSelectChannelForSlot(pickerSlotIndex, channel)}
                    className={`tv-focusable flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-blue-600/20 border-blue-500 shadow-md text-white'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-gray-200 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
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
                          <Tv className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="truncate min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-white truncate">{channel.name}</h4>
                        <div className="flex items-center space-x-1 text-[11px] text-gray-400 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 text-gray-300">{channel.category || 'Live TV'}</span>
                          {channel.country && <span className="truncate">{channel.country}</span>}
                        </div>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="px-2 py-1 rounded-md bg-blue-600 text-white text-[10px] font-bold shrink-0 ml-2">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-blue-600 text-gray-300 hover:text-white text-[11px] font-semibold shrink-0 ml-2">
                        Select
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredPickerChannels.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-xs">
                No channels found matching "{pickerSearch}". Try another search.
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-gray-400">
              <span>Showing {filteredPickerChannels.length} available channels</span>
              <button
                onClick={() => setPickerSlotIndex(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
