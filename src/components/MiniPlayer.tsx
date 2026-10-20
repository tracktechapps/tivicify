import React from 'react';
import { Play, Pause, Maximize2, X, Radio } from 'lucide-react';
import { MediaItem } from '../types';

interface MiniPlayerProps {
  media: MediaItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExpand: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  media,
  isPlaying,
  onTogglePlay,
  onExpand,
  onClose,
}) => {
  const isLive = media.type === 'live' || media.duration === 'Live';

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 w-72 sm:w-80 rounded-2xl overflow-hidden glass-panel border border-slate-700/80 shadow-2xl animate-fade-in group select-none">
      
      {/* Video Preview Aspect */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden cursor-pointer" onClick={onExpand}>
        <img
          src={media.backdropUrl || media.posterUrl}
          alt={media.title}
          className="w-full h-full object-cover filter brightness-[0.7]"
        />
        
        {/* Play State Badge */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="p-3 rounded-full bg-blue-600/90 text-white shadow-lg hover:scale-110 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Live Indicator */}
        {isLive && (
          <div className="absolute top-2 left-2 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
            <Radio className="w-2.5 h-2.5" />
            <span>LIVE</span>
          </div>
        )}

        {/* Action Controls on Top */}
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors"
            title="Expand Full Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors"
            title="Close Stream"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="p-3 flex items-center justify-between bg-slate-900/95">
        <div className="overflow-hidden pr-2">
          <h4 className="text-xs font-bold text-white truncate">{media.title}</h4>
          <p className="text-[10px] text-gray-400 truncate">{media.genres[0]} • {media.year || '2024'}</p>
        </div>

        <button
          onClick={onExpand}
          className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-[11px] font-bold transition-all flex-shrink-0"
        >
          Expand
        </button>
      </div>
    </div>
  );
};
