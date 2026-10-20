import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon, Film, Radio, Sparkles, Loader2 } from 'lucide-react';
import { MediaItem, ChannelItem } from '../types';
import { tmdbService } from '../services/tmdbService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  curatedItems: MediaItem[];
  customItems: MediaItem[];
  channels: ChannelItem[];
  onSelectMedia: (media: MediaItem) => void;
  tmdbApiKey?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  curatedItems,
  customItems,
  channels,
  onSelectMedia,
  tmdbApiKey = '',
}) => {
  const [query, setQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<MediaItem[]>([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setTmdbResults([]);
    }
  }, [isOpen]);

  // Search TMDB with debounce
  useEffect(() => {
    if (!query.trim() || !tmdbApiKey) {
      setTmdbResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingTmdb(true);
      try {
        const results = await tmdbService.search(query, tmdbApiKey);
        setTmdbResults(results);
      } catch {
        setTmdbResults([]);
      } finally {
        setIsSearchingTmdb(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, tmdbApiKey]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Local search across curated & custom
  const matchedCurated = normalizedQuery
    ? curatedItems.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.genres.some((g) => g.toLowerCase().includes(normalizedQuery)) ||
          (item.director && item.director.toLowerCase().includes(normalizedQuery))
      )
    : [];

  const matchedCustom = normalizedQuery
    ? customItems.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.genres.some((g) => g.toLowerCase().includes(normalizedQuery))
      )
    : [];

  const matchedChannels = normalizedQuery
    ? channels.filter(
        (ch) =>
          ch.name.toLowerCase().includes(normalizedQuery) ||
          ch.category.toLowerCase().includes(normalizedQuery)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-20 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Search Input Bar */}
        <div className="relative flex items-center p-4 border-b border-slate-800">
          <SearchIcon className="w-5 h-5 text-gray-400 ml-2" />
          <input
            type="text"
            autoFocus
            placeholder="Search movies, public domain cinema, live TV, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent pl-3 pr-10 text-white placeholder-gray-500 text-base sm:text-lg focus:outline-none"
          />
          {isSearchingTmdb && <Loader2 className="w-4 h-4 text-blue-400 animate-spin mr-3" />}
          <button
            onClick={onClose}
            className="tv-focusable p-1.5 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto custom-scrollbar p-4 space-y-6 flex-1">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-gray-500">
              <Film className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Type a movie title, actor, or genre to search</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['Sci-Fi', 'Horror', 'Animation', 'NASA', 'Comedy', '1927', '1968'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 rounded-full text-xs bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : matchedCurated.length === 0 &&
            matchedCustom.length === 0 &&
            matchedChannels.length === 0 &&
            tmdbResults.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {/* Curated & Open Movies Results */}
              {matchedCurated.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free & Legal Masterpieces ({matchedCurated.length})</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {matchedCurated.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onClose();
                          onSelectMedia(item);
                        }}
                        className="tv-focusable group cursor-pointer rounded-xl bg-slate-800/80 p-2 hover:bg-slate-700/80 transition-all hover:scale-105"
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-900 mb-2">
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-gray-200 group-hover:text-blue-400 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-gray-400">{item.year} • {item.genres[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Channels */}
              {matchedChannels.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Live TV Channels ({matchedChannels.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedChannels.map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => {
                          onClose();
                          onSelectMedia({
                            id: channel.id,
                            title: channel.name,
                            description: channel.currentProgram || 'Live TV Broadcast',
                            type: 'live',
                            source: 'iptv',
                            genres: ['Live TV', channel.category],
                            posterUrl: channel.logoUrl || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=500&q=80',
                            backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
                            streamUrl: channel.streamUrl,
                            streamType: 'hls',
                            year: 2024,
                            duration: 'Live',
                            rating: 'Live',
                          });
                        }}
                        className="tv-focusable flex items-center space-x-3 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {channel.logoUrl ? (
                            <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-cover" />
                          ) : (
                            <Radio className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-200">{channel.name}</h4>
                          <span className="text-[10px] text-gray-400">{channel.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TMDB Results */}
              {tmdbResults.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
                    TMDB Online Catalog ({tmdbResults.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {tmdbResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onClose();
                          onSelectMedia(item);
                        }}
                        className="tv-focusable group cursor-pointer rounded-xl bg-slate-800/80 p-2 hover:bg-slate-700/80 transition-all hover:scale-105"
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-900 mb-2">
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-gray-200 group-hover:text-sky-400 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-gray-400">{item.year} • {item.genres[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
