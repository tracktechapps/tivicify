import React from 'react';
import { Play, X, Bookmark, BookmarkCheck, Calendar, Clock, Star, Film, User } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaDetailModalProps {
  media: MediaItem | null;
  onClose: () => void;
  onPlay: (media: MediaItem) => void;
  onToggleWatchlist: (media: MediaItem) => void;
  isInWatchlist: boolean;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  media,
  onClose,
  onPlay,
  onToggleWatchlist,
  isInWatchlist,
}) => {
  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto custom-scrollbar rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="tv-focusable absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 hover:bg-slate-800 text-gray-300 hover:text-white transition-all hover:scale-105"
          title="Close (Esc)"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <img
            src={media.backdropUrl || media.posterUrl}
            alt={media.title}
            className="w-full h-full object-cover object-center filter brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          {/* Quick Play Floating Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => {
                onClose();
                onPlay(media);
              }}
              className="tv-focusable p-4 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white shadow-2xl shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all"
              title="Play Video"
            >
              <Play className="w-10 h-10 fill-current ml-1" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 -mt-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Poster Thumbnail */}
            <div className="hidden sm:block flex-shrink-0 w-36 md:w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700/80 -mt-16">
              <img
                src={media.posterUrl}
                alt={media.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Information Column */}
            <div className="flex-1">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {media.isPublicDomain && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Public Domain Asset
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {media.type.toUpperCase()}
                </span>
                {media.rating && (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Star className="w-3 h-3 fill-current text-amber-400" />
                    <span>{media.rating}</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
                {media.title}
              </h2>

              {/* Metadata Meta Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-400 mb-4 font-medium">
                {media.year && (
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{media.year}</span>
                  </span>
                )}
                {media.duration && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{media.duration}</span>
                  </span>
                )}
                {media.director && (
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Dir: {media.director}</span>
                  </span>
                )}
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {media.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-sky-300 border border-slate-700"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                Synopsis
              </h3>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed mb-6">
                {media.description}
              </p>

              {/* Cast Members */}
              {media.cast && media.cast.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Cast & Performers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {media.cast.map((actor) => (
                      <span
                        key={actor}
                        className="px-2.5 py-1 rounded-md text-xs bg-slate-800/80 text-gray-300 border border-slate-700/50"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onPlay(media);
                  }}
                  className="tv-focusable flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Streaming</span>
                </button>

                <button
                  onClick={() => onToggleWatchlist(media)}
                  className={`tv-focusable flex items-center space-x-2 px-5 py-3 rounded-xl border text-sm sm:text-base font-semibold transition-all hover:scale-105 active:scale-95 ${
                    isInWatchlist
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-gray-200 hover:bg-slate-700'
                  }`}
                >
                  {isInWatchlist ? (
                    <>
                      <BookmarkCheck className="w-5 h-5 text-indigo-400" />
                      <span>In Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-5 h-5" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
