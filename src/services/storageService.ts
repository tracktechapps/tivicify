import { MediaItem, ChannelItem, WatchProgress, AppSettings } from '../types';

const STORAGE_KEYS = {
  WATCHLIST: 'tivicify_watchlist',
  PROGRESS: 'tivicify_progress',
  CUSTOM_STREAMS: 'tivicify_custom_streams',
  CUSTOM_CHANNELS: 'tivicify_custom_channels',
  SETTINGS: 'tivicify_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  tvMode: false,
  tmdbApiKey: '',
  autoPlayNext: true,
  defaultQuality: 'auto',
  volume: 1,
  kidsMode: false,
  audioBoost: 1,
  nightModeAudio: false,
  ambientGlow: true,
  themeColor: 'blue',
  soundEffects: false,
};

export const storageService = {
  // Watchlist
  getWatchlist(): MediaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isInWatchlist(id: string): boolean {
    const list = this.getWatchlist();
    return list.some((item) => item.id === id);
  },

  toggleWatchlist(item: MediaItem): boolean {
    const list = this.getWatchlist();
    const index = list.findIndex((x) => x.id === item.id);
    let isAdded = false;
    if (index >= 0) {
      list.splice(index, 1);
      isAdded = false;
    } else {
      list.unshift(item);
      isAdded = true;
    }
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    return isAdded;
  },

  // Continue Watching / Progress
  getProgressList(): WatchProgress[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveProgress(media: MediaItem, currentTime: number, duration: number) {
    if (!duration || duration <= 0) return;
    const list = this.getProgressList().filter((p) => p.mediaId !== media.id);
    const percentage = Math.min(100, Math.round((currentTime / duration) * 100));

    // If watched over 95%, don't clutter continue watching
    if (percentage < 95 && currentTime > 5) {
      list.unshift({
        mediaId: media.id,
        title: media.title,
        posterUrl: media.backdropUrl || media.posterUrl,
        currentTime,
        duration,
        percentage,
        lastWatchedAt: Date.now(),
      });
    }

    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(list.slice(0, 15)));
  },

  getProgress(mediaId: string): number {
    const list = this.getProgressList();
    const found = list.find((p) => p.mediaId === mediaId);
    return found ? found.currentTime : 0;
  },

  removeProgress(mediaId: string) {
    const list = this.getProgressList().filter((p) => p.mediaId !== mediaId);
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(list));
  },

  // Custom User Streams
  getCustomStreams(): MediaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_STREAMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addCustomStream(stream: MediaItem) {
    const list = this.getCustomStreams().filter((s) => s.id !== stream.id);
    list.unshift(stream);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_STREAMS, JSON.stringify(list));
  },

  removeCustomStream(id: string) {
    const list = this.getCustomStreams().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_STREAMS, JSON.stringify(list));
  },

  // Custom M3U IPTV Channels
  getCustomChannels(): ChannelItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_CHANNELS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomChannels(channels: ChannelItem[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CHANNELS, JSON.stringify(channels));
  },

  clearCustomChannels() {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_CHANNELS);
  },

  // Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },
};
