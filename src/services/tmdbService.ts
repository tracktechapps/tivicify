import { MediaItem } from '../types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  media_type?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy',
};

export const tmdbService = {
  async getTrending(apiKey: string): Promise<MediaItem[]> {
    if (!apiKey) return [];
    try {
      const res = await fetch(`${TMDB_BASE_URL}/trending/all/week?api_key=${apiKey}`);
      if (!res.ok) throw new Error('Failed to fetch trending');
      const data = await res.json();
      return (data.results || []).map((item: TMDBResult) => this.formatItem(item));
    } catch (e) {
      console.error('TMDB error:', e);
      return [];
    }
  },

  async getTopRated(apiKey: string): Promise<MediaItem[]> {
    if (!apiKey) return [];
    try {
      const res = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${apiKey}`);
      if (!res.ok) throw new Error('Failed to fetch top rated');
      const data = await res.json();
      return (data.results || []).map((item: TMDBResult) => this.formatItem(item));
    } catch (e) {
      console.error('TMDB error:', e);
      return [];
    }
  },

  async search(query: string, apiKey: string): Promise<MediaItem[]> {
    if (!apiKey || !query.trim()) return [];
    try {
      const res = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to search TMDB');
      const data = await res.json();
      return (data.results || [])
        .filter((item: TMDBResult) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item: TMDBResult) => this.formatItem(item));
    } catch (e) {
      console.error('TMDB search error:', e);
      return [];
    }
  },

  async getTrailer(id: string, apiKey: string, type: 'movie' | 'tv' = 'movie'): Promise<string | undefined> {
    if (!apiKey) return undefined;
    try {
      const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${apiKey}`);
      if (!res.ok) return undefined;
      const data = await res.json();
      const trailer = data.results?.find((v: { site: string; type: string; key: string }) => 
        v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );
      return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : undefined;
    } catch {
      return undefined;
    }
  },

  formatItem(item: TMDBResult): MediaItem {
    const isTV = item.media_type === 'tv' || !!item.first_air_date;
    const title = item.title || item.name || 'Untitled';
    const dateStr = item.release_date || item.first_air_date;
    const year = dateStr ? new Date(dateStr).getFullYear() : 2024;
    const genres = (item.genre_ids || []).map((gid) => GENRE_MAP[gid]).filter(Boolean);

    return {
      id: `tmdb-${item.id}`,
      title,
      originalTitle: item.original_title || item.original_name,
      description: item.overview || 'No overview available.',
      type: isTV ? 'tv' : 'movie',
      source: 'tmdb',
      genres: genres.length > 0 ? genres : ['Cinema'],
      posterUrl: item.poster_path
        ? `${IMAGE_BASE_URL}/w500${item.poster_path}`
        : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80',
      backdropUrl: item.backdrop_path
        ? `${IMAGE_BASE_URL}/original${item.backdrop_path}`
        : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      // For TMDB items without direct stream, fallback to Big Buck Bunny / open stream for preview
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      streamType: 'mp4',
      year,
      duration: isTV ? 'Series' : '1h 50m',
      rating: item.vote_average ? item.vote_average.toFixed(1) : '7.5',
      featured: false,
    };
  },
};
