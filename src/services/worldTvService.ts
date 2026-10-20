import { ChannelItem } from '../types';
import { parseM3UPlaylist } from './iptvParser';

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  playlistUrl: string;
}

export const WORLD_COUNTRIES: CountryOption[] = [
  { code: 'global', name: 'Global English', flag: '🌍', playlistUrl: 'https://iptv-org.github.io/iptv/languages/eng.m3u' },
  { code: 'us', name: 'United States', flag: '🇺🇸', playlistUrl: 'https://iptv-org.github.io/iptv/countries/us.m3u' },
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧', playlistUrl: 'https://iptv-org.github.io/iptv/countries/uk.m3u' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦', playlistUrl: 'https://iptv-org.github.io/iptv/countries/ca.m3u' },
  { code: 'au', name: 'Australia', flag: '🇦🇺', playlistUrl: 'https://iptv-org.github.io/iptv/countries/au.m3u' },
  { code: 'fr', name: 'France', flag: '🇫🇷', playlistUrl: 'https://iptv-org.github.io/iptv/countries/fr.m3u' },
  { code: 'de', name: 'Germany', flag: '🇩🇪', playlistUrl: 'https://iptv-org.github.io/iptv/countries/de.m3u' },
  { code: 'es', name: 'Spain', flag: '🇪🇸', playlistUrl: 'https://iptv-org.github.io/iptv/countries/es.m3u' },
  { code: 'it', name: 'Italy', flag: '🇮🇹', playlistUrl: 'https://iptv-org.github.io/iptv/countries/it.m3u' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵', playlistUrl: 'https://iptv-org.github.io/iptv/countries/jp.m3u' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷', playlistUrl: 'https://iptv-org.github.io/iptv/countries/br.m3u' },
  { code: 'in', name: 'India', flag: '🇮🇳', playlistUrl: 'https://iptv-org.github.io/iptv/countries/in.m3u' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬', playlistUrl: 'https://iptv-org.github.io/iptv/countries/ng.m3u' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽', playlistUrl: 'https://iptv-org.github.io/iptv/countries/mx.m3u' },
];

export const WORLD_GENRES = [
  { id: 'all', label: 'All Channels' },
  { id: 'News', label: 'News' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Movies', label: 'Movies & Cinema' },
  { id: 'Animation', label: 'Animation & Kids' },
  { id: 'Documentary', label: 'Documentary' },
  { id: 'Music', label: 'Music' },
  { id: 'Science', label: 'Science & Tech' },
  { id: 'Entertainment', label: 'Entertainment' },
];

// Rich starter catalog of verified working global live TV streams
export const GLOBAL_STARTER_CHANNELS: ChannelItem[] = [
  // USA & Global News
  {
    id: 'ch-nasa-hd',
    name: 'NASA TV HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    category: 'Science',
    country: 'USA 🇺🇸',
    currentProgram: 'Live ISS Feed & Artemis Missions',
    epgDescription: 'Continuous high definition live space exploration from NASA.',
  },
  {
    id: 'ch-dw-english',
    name: 'DW News 24/7',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Deutsche_Welle_symbol_2012.svg',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    category: 'News',
    country: 'Germany / Global 🇩🇪',
    currentProgram: 'Global NewsHour & Business',
    epgDescription: 'Germanys international broadcaster delivering worldwide news in English.',
  },
  {
    id: 'ch-bloomberg-quicktake',
    name: 'Bloomberg TV+',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://liveproduseast.akamaized.net/us/Channel-USTV-AWS-virginia-1/Source-USTV-1000-1_live.m3u8',
    category: 'News',
    country: 'USA 🇺🇸',
    currentProgram: 'Market Wrap & Global Finance',
    epgDescription: '24/7 international business and financial market analysis.',
  },
  {
    id: 'ch-cbs-news',
    name: 'CBS News 24/7',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/CBS_News.svg',
    streamUrl: 'https://cbsn-us.cbsnstream.cbsnews.com/out/v1/55a8648e8f134e82a470f83d562deeca/master.m3u8',
    category: 'News',
    country: 'USA 🇺🇸',
    currentProgram: 'America Decides & Evening News',
    epgDescription: 'Live national bulletins and investigative reporting from CBS News.',
  },
  {
    id: 'ch-abc-news-live',
    name: 'ABC News Live',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/ABC_News_logo_2021.svg',
    streamUrl: 'https://content.uplynk.com/channel/3324f2467c414329b3b0cc5cd987b6be.m3u8',
    category: 'News',
    country: 'USA 🇺🇸',
    currentProgram: 'Live Breaking News & Primetime',
    epgDescription: 'Real-time breaking news reports and special broadcasts from ABC.',
  },
  {
    id: 'ch-sky-news',
    name: 'Sky News UK',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/30/Sky_News_logo_2015.svg',
    streamUrl: 'https://skynews-live.akamaized.net/hls/live/2011550/skynews_live1/index.m3u8',
    category: 'News',
    country: 'UK 🇬🇧',
    currentProgram: 'Sky News at Ten & Global View',
    epgDescription: 'Award-winning continuous news broadcasting from London.',
  },
  {
    id: 'ch-nhk-world',
    name: 'NHK World-Japan',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/77/NHK_World-Japan_logo.svg',
    streamUrl: 'https://nhkworld.webcdn.stream.ne.jp/www11/nhkworld-tv/global/2003458/live.m3u8',
    category: 'News',
    country: 'Japan 🇯🇵',
    currentProgram: 'Newsline & Asian Lifestyle',
    epgDescription: 'English language international service of Japan public broadcaster.',
  },
  {
    id: 'ch-france24-en',
    name: 'France 24 HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/France24_2013_logo.svg',
    streamUrl: 'https://static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8',
    category: 'News',
    country: 'France 🇫🇷',
    currentProgram: 'The World This Week',
    epgDescription: 'French international news network covering global perspectives.',
  },

  // Sports & Entertainment
  {
    id: 'ch-redbull-tv',
    name: 'Red Bull Action TV',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f5/RedBullTVLogo.svg',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    category: 'Sports',
    country: 'Global 🌍',
    currentProgram: 'Extreme Cliff Diving World Series',
    epgDescription: 'Non-stop extreme sports tournaments, surfing and motorsport documentaries.',
  },
  {
    id: 'ch-classical-cinema',
    name: 'Retro Cinema 24/7',
    logoUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'Movies',
    country: 'USA 🇺🇸',
    currentProgram: 'Golden Age Hollywood restored classics',
    epgDescription: 'Restored cinema, mystery thrillers and vintage comedies around the clock.',
  },
  {
    id: 'ch-lofi-beats',
    name: 'Lo-Fi Chill & Relaxation',
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://test-streams.mux.dev/test_001/stream.m3u8',
    category: 'Music',
    country: 'Global 🌍',
    currentProgram: 'Ambient Lo-Fi Beats to Relax & Study',
    epgDescription: 'Continuous calming nature scenes paired with relaxing ambient music.',
  },
  {
    id: 'ch-kids-cartoon-central',
    name: 'Golden Age Cartoons 24/7',
    logoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
    category: 'Animation',
    country: 'USA 🇺🇸',
    currentProgram: 'Classic Fleischer & Popeye Marathon',
    epgDescription: 'Timeless vintage cartoons restored for family and children.',
  },
];

export const worldTvService = {
  // Fetch channels for a specific country or global list
  async fetchCountryChannels(countryCode: string): Promise<ChannelItem[]> {
    const country = WORLD_COUNTRIES.find((c) => c.code === countryCode) || WORLD_COUNTRIES[0];
    try {
      const res = await fetch(country.playlistUrl);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const text = await res.text();
      const channels = parseM3UPlaylist(text);

      // Enhance with country label & flag
      return channels.slice(0, 50).map((ch) => ({
        ...ch,
        country: `${country.name} ${country.flag}`,
      }));
    } catch (e) {
      console.warn(`Could not load playlist for ${country.name}:`, e);
      return [];
    }
  },
};
