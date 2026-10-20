import React from 'react';
import { Play, Info, Bookmark, BookmarkCheck, Sparkles, Film } from 'lucide-react';
import { MediaItem } from '../types';

interface HeroBannerProps {
  media: MediaItem;
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  onToggleWatchlist: (media: MediaItem) => void;
  isInWatchlist: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  media,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  isInWatchlist,
}) => {
  return (
    <div className="relative w-full h-[60vh] min-h-[420px] max-h-[680px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl mb-8 group">
      {/* Background Backdrop Image */}
      <img
        src={media.backdropUrl || media.posterUrl}
        alt={media.title}
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.05] group-hover:scale-105 transition-transform duration-1000 ease-out"
        loading="eager"
      />

      {/* Cinematic Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080c14] via-[#080c14]/70 to-transparent max-w-3xl" />

      {/* Hero Content */}
      <div className="relative z-10 h-full max-w-3xl flex flex-col justify-end p-6 md:p-12 pb-10">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-600/90 text-white shadow-md">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>Featured Spotlight</span>
          </span>

          {media.isPublicDomain && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Public Domain
            </span>
          )}

          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-gray-200 backdrop-blur-sm">
            4K UHD
          </span>

          {media.rating && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ★ {media.rating}
            </span>
          )}

          <span className="text-xs text-gray-300 font-medium">
            {media.year} • {media.duration}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-lg">
          {media.title}
        </h1>

        {/* Genres */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-sky-300 font-medium mb-3">
          {media.genres.map((genre) => (
            <span key={genre} className="bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-800/40">
              {genre}
            </span>
          ))}
          {media.director && (
            <span className="text-gray-400 ml-1">
              Dir. {media.director}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-300 line-clamp-3 md:line-clamp-4 max-w-2xl mb-6 drop-shadow leading-relaxed">
          {media.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onPlay(media)}
            className="tv-focusable flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm md:text-base shadow-lg shadow-blue-600/40 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Watch Now</span>
          </button>

          <button
            onClick={() => onOpenDetails(media)}
            className="tv-focusable flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-gray-200 font-semibold text-sm md:text-base border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
          >
            <Info className="w-5 h-5 text-gray-400" />
            <span>Details</span>
          </button>

          <button
            onClick={() => onToggleWatchlist(media)}
            className={`tv-focusable p-3 rounded-xl border backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
              isInWatchlist
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-800/60 border-white/10 text-gray-300 hover:text-white'
            }`}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            aria-label="Toggle Watchlist"
          >
            {isInWatchlist ? (
              <BookmarkCheck className="w-5 h-5 fill-current text-indigo-400" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
