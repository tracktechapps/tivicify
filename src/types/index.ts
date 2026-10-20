export type MediaType = 'movie' | 'tv' | 'live' | 'animation' | 'documentary';

export type StreamSource = 'curated' | 'tmdb' | 'custom' | 'iptv';

export interface SubtitleTrack {
  lang: string;
  label: string;
  src: string;
  isDefault?: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  description: string;
  type: MediaType;
  source: StreamSource;
  genres: string[];
  posterUrl: string;
  backdropUrl: string;
  streamUrl: string;
  streamType: 'hls' | 'mp4' | 'embed';
  year: number;
  duration?: string; // e.g., "1h 36m" or "Live"
  rating?: string; // e.g., "8.4" or "PG-13"
  isPublicDomain?: boolean;
  director?: string;
  cast?: string[];
  trailerUrl?: string;
  channelNumber?: number;
  featured?: boolean;
  subtitles?: SubtitleTrack[];
}

export interface ChannelItem {
  id: string;
  name: string;
  logoUrl?: string;
  streamUrl: string;
  category: string;
  country?: string;
  currentProgram?: string;
  epgDescription?: string;
}

export interface WatchProgress {
  mediaId: string;
  title: string;
  posterUrl: string;
  currentTime: number;
  duration: number;
  percentage: number;
  lastWatchedAt: number;
}

export type NavTab = 'home' | 'movies' | 'live' | 'custom' | 'watchlist' | 'search';

export interface AppSettings {
  tvMode: boolean;
  tmdbApiKey: string;
  autoPlayNext: boolean;
  defaultQuality: 'auto' | '1080p' | '720p' | '480p';
  volume: number;
}
