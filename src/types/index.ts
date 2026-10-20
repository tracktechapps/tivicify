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
  duration?: string;
  rating?: string;
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
  kidsMode: boolean;
  audioBoost: number; // 1 = 100%, 1.5 = 150%, 2 = 200%
  nightModeAudio: boolean;
  ambientGlow: boolean;
  themeColor: 'blue' | 'red' | 'purple' | 'amber' | 'emerald';
  soundEffects: boolean;
}

export interface StreamStats {
  resolution: string;
  bitrateKbps: number;
  bufferedSeconds: number;
  droppedFrames: number;
  latencyMs: number;
  hlsVersion: string;
}
