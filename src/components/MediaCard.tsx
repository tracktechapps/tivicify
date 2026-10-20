import React from 'react';
import { Play, Sparkles, Film, Radio } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaCardProps {
  media: MediaItem;
  onSelect: (media: MediaItem) => void;
  progressPercentage?: number;
  aspectRatio?: 'poster' | 'backdrop';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onSelect,
  progressPercentage,
  aspectRatio = 'poster',
}) => {
  const isPoster = aspectRatio === 'poster';

  return (
    <div
      onClick={() => onSelect(media)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSelect(media);
        }
      }}
      tabIndex={0}
      role="button"
      className={`tv-focusable group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.04] active:scale-95 shadow-md hover:shadow-xl hover:shadow-blue-500/10 ${
        isPoster ? 'w-36 sm:w-44 md:w-52' : 'w-60 sm:w-72 md:w-80'
      }`}
    >
      {/* Thumbnail Container */}
      <div
        className={`relative w-full overflow-hidden bg-slate-950 ${
          isPoster ? 'aspect-[2/3]' : 'aspect-video'
        }`}
      >
        <img
          src={isPoster ? media.posterUrl : (media.backdropUrl || media.posterUrl)}
          alt={media.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hover / Focus Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Play Icon on Hover/Focus */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Badges on Top */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {media.isPublicDomain ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/90 text-white shadow">
              Open Asset
            </span>
          ) : media.type === 'live' ? (
            <span className="flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white shadow animate-pulse">
              <Radio className="w-2.5 h-2.5" />
              <span>LIVE</span>
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-900/80 text-gray-300 backdrop-blur-sm">
              {media.genres[0] || 'Film'}
            </span>
          )}

          {media.rating && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/90 text-slate-950 shadow">
              ★ {media.rating}
            </span>
          )}
        </div>

        {/* Continue Watching Progress Bar */}
        {progressPercentage !== undefined && progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-1">
          {media.title}
        </h3>
        
        <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
          <span>{media.year}</span>
          <span>{media.duration}</span>
        </div>
      </div>
    </div>
  );
};
