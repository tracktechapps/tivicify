import { ChannelItem } from '../types';
import { parseM3UPlaylist } from './iptvParser';
import { storageService } from './storageService';

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  playlistUrl: string;
}

export interface IptvDirectoryOption {
  id: string;
  name: string;
  icon: string;
  playlistUrl: string;
  group: 'category' | 'region' | 'freetv';
}

export const WORLD_COUNTRIES: CountryOption[] = [
  { code: 'global', name: 'Global English', flag: '🌍', playlistUrl: 'https://iptv-org.github.io/iptv/languages/eng.m3u' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬', playlistUrl: 'https://iptv-org.github.io/iptv/countries/ng.m3u' },
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
  { code: 'za', name: 'South Africa', flag: '🇿🇦', playlistUrl: 'https://iptv-org.github.io/iptv/countries/za.m3u' },
  { code: 'gh', name: 'Ghana', flag: '🇬🇭', playlistUrl: 'https://iptv-org.github.io/iptv/countries/gh.m3u' },
  { code: 'ke', name: 'Kenya', flag: '🇰🇪', playlistUrl: 'https://iptv-org.github.io/iptv/countries/ke.m3u' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽', playlistUrl: 'https://iptv-org.github.io/iptv/countries/mx.m3u' },
];

// IPTV-org and Free-TV Official Category & Region Directories
export const IPTV_ORG_DIRECTORIES: IptvDirectoryOption[] = [
  // Kids & Cartoons
  { id: 'dir-kids-zone', name: 'Kid Zone & Cartoons', icon: '👶', playlistUrl: 'https://iptv-org.github.io/iptv/categories/kids.m3u', group: 'category' },
  { id: 'dir-animation', name: 'Animation & Anime', icon: '🎨', playlistUrl: 'https://iptv-org.github.io/iptv/categories/animation.m3u', group: 'category' },

  // Tech, Science & Docs
  { id: 'dir-tech-science', name: 'Tech, Science & STEM', icon: '🔬', playlistUrl: 'https://iptv-org.github.io/iptv/categories/science.m3u', group: 'category' },
  { id: 'dir-documentary', name: 'Documentaries & Nature', icon: '🦁', playlistUrl: 'https://iptv-org.github.io/iptv/categories/documentary.m3u', group: 'category' },

  // Movies & Series
  { id: 'dir-movies', name: 'Movies & Cinema', icon: '🎬', playlistUrl: 'https://iptv-org.github.io/iptv/categories/movies.m3u', group: 'category' },
  { id: 'dir-classic', name: 'Classic TV', icon: '📺', playlistUrl: 'https://iptv-org.github.io/iptv/categories/classic.m3u', group: 'category' },
  { id: 'dir-series', name: 'Series & Drama', icon: '🍿', playlistUrl: 'https://iptv-org.github.io/iptv/categories/series.m3u', group: 'category' },
  { id: 'dir-comedy', name: 'Comedy & Shows', icon: '🎭', playlistUrl: 'https://iptv-org.github.io/iptv/categories/comedy.m3u', group: 'category' },
  { id: 'dir-sports', name: 'Sports TV', icon: '⚽', playlistUrl: 'https://iptv-org.github.io/iptv/categories/sports.m3u', group: 'category' },
  { id: 'dir-news', name: 'World News 24/7', icon: '📰', playlistUrl: 'https://iptv-org.github.io/iptv/categories/news.m3u', group: 'category' },
  { id: 'dir-music', name: 'Music & Concerts', icon: '🎵', playlistUrl: 'https://iptv-org.github.io/iptv/categories/music.m3u', group: 'category' },

  // Free-TV Repository (github.com/free-tv/iptv)
  { id: 'dir-freetv-master', name: 'Free-TV Global Master (2000+)', icon: '⚡', playlistUrl: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8', group: 'freetv' },
  { id: 'dir-freetv-usa', name: 'Free-TV USA Streams', icon: '🇺🇸', playlistUrl: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_usa.m3u8', group: 'freetv' },
  { id: 'dir-freetv-uk', name: 'Free-TV UK Streams', icon: '🇬🇧', playlistUrl: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_uk.m3u8', group: 'freetv' },
  { id: 'dir-freetv-nigeria', name: 'Free-TV Nigeria Direct', icon: '🇳🇬', playlistUrl: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_nigeria.m3u8', group: 'freetv' },
  { id: 'dir-freetv-movies', name: 'Free-TV Movies Collection', icon: '🎞️', playlistUrl: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_zz_movies.m3u8', group: 'freetv' },
  { id: 'dir-freetv-docs', name: 'Free-TV Docs & Wildlife', icon: '🌿', playlistUrl: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_zz_documentaries_en.m3u8', group: 'freetv' },

  // Regions
  { id: 'dir-africa', name: 'Pan-Africa Streams', icon: '🌍', playlistUrl: 'https://iptv-org.github.io/iptv/regions/afr.m3u', group: 'region' },
  { id: 'dir-americas', name: 'Americas', icon: '🌎', playlistUrl: 'https://iptv-org.github.io/iptv/regions/nam.m3u', group: 'region' },
  { id: 'dir-europe', name: 'Europe', icon: '🏰', playlistUrl: 'https://iptv-org.github.io/iptv/regions/eur.m3u', group: 'region' },
  { id: 'dir-asia', name: 'Asia-Pacific', icon: '🌏', playlistUrl: 'https://iptv-org.github.io/iptv/regions/asia.m3u', group: 'region' },
];

export const WORLD_GENRES = [
  { id: 'all', label: 'All Channels' },
  { id: 'Kids', label: 'Kid Zone & Cartoons' },
  { id: 'Tech', label: 'Tech & Science' },
  { id: 'News', label: 'News 24/7' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Movies', label: 'Movies & Cinema' },
  { id: 'Animation', label: 'Animation & Anime' },
  { id: 'Documentary', label: 'Documentary' },
  { id: 'Music', label: 'Music' },
  { id: 'Entertainment', label: 'Entertainment' },
  { id: 'Culture', label: 'Culture & Local' },
  { id: 'Religious', label: 'Faith & Community' },
];

// Rich starter catalog of verified working live TV streams
export const GLOBAL_STARTER_CHANNELS: ChannelItem[] = [
  // --- KID ZONE & CARTOONS (Verified working streams) ---
  {
    id: 'ch-cartoon-network',
    name: 'Cartoon Network (India)',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Cartoon_Network_2010_logo.svg',
    streamUrl: 'https://drk6xq0vhn.gpcdn.net/live/cn_sd_abr/index.m3u8',
    category: 'Kids',
    country: 'Kid Zone 👶',
    currentProgram: 'Ben 10, Teen Titans & Classic Toons',
    epgDescription: 'Non-stop top-rated animation series, adventures, and cartoons for children of all ages.',
  },
  {
    id: 'ch-cartoon-classics',
    name: 'Cartoon Classics 24/7',
    logoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://daiconnect.com/live/hls/tvup/rk-cartoonclassics/578f4b7eb725168349ec0af81b21d388/index.m3u8',
    category: 'Kids',
    country: 'Kid Zone 👶',
    currentProgram: 'Looney Tunes, Popeye & Vintage Cartoons',
    epgDescription: 'Timeless classic animation, Popeye, Betty Boop, and Golden Age animated shorts restored.',
  },
  {
    id: 'ch-abc-kids',
    name: 'ABC Kids TV Zone',
    logoUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://c.mjh.nz/abc-kids.m3u8',
    category: 'Kids',
    country: 'Kid Zone 👶',
    currentProgram: 'Preschool Learning & Animated Adventures',
    epgDescription: 'Safe, educational, award-winning programs designed for young children and families.',
  },
  {
    id: 'ch-abc-entertains',
    name: 'ABC Entertains & Toons',
    logoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://c.mjh.nz/abc-me.m3u8',
    category: 'Kids',
    country: 'Kid Zone 👶',
    currentProgram: 'Action Animated Series & Comedy Toons',
    epgDescription: 'High-energy youth series, cartoons, gaming shows, and comedy animation.',
  },
  {
    id: 'ch-3abn-kids',
    name: '3ABN Kids TV',
    logoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://3abn.bozztv.com/3abn2/Kids_live/smil:Kids_live.smil/playlist.m3u8',
    category: 'Kids',
    country: 'Kid Zone 👶',
    currentProgram: 'Nature Tales & Kids Bible Adventures',
    epgDescription: 'Wholesome family programming, science explorations, songs, and puppet adventures.',
  },
  {
    id: 'ch-bejoy-kids',
    name: 'BeJoy Kids Family TV',
    logoUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://stream.paroledivita.org/bejoy.m3u8',
    category: 'Kids',
    country: 'Kid Zone 👶',
    currentProgram: 'Animated Tales & Character Building',
    epgDescription: 'Delightful animations, family storytelling, and cheerful songs for youngsters.',
  },

  // --- TECH, SCIENCE & SPACE EXPLORATION ---
  {
    id: 'ch-discovery-channel',
    name: 'Discovery Channel HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Discovery_Channel_logo_2019.svg',
    streamUrl: 'https://streaming.aurora.enhanced.live/live/mpc/enl0eG1mLmVncmVzcy5mZDJ2eHI=/out/v1/IT_SIMULCAST/DISCOVERYCHANNEL/CMAF/index.m3u8',
    category: 'Tech',
    country: 'Tech & Science 🔬',
    currentProgram: 'Mythbusters, Engineering Feats & Science',
    epgDescription: 'Premier international science and technology network exploring modern innovation and wildlife.',
  },
  {
    id: 'ch-discovery-science',
    name: 'Discovery Science HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Discovery_Science_logo_2017.svg',
    streamUrl: 'https://drk6xq0vhn.gpcdn.net/live/discovery_science_abr/index.m3u8',
    category: 'Tech',
    country: 'Tech & Science 🔬',
    currentProgram: 'How It\'s Made & Space Mysteries',
    epgDescription: 'In-depth tech documentaries, futuristic robotics, physics breakthroughs, and cosmos explorations.',
  },
  {
    id: 'ch-nasa-hd',
    name: 'NASA TV HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    category: 'Tech',
    country: 'USA / Tech 🚀',
    currentProgram: 'Live ISS Feed & Artemis Deep Space',
    epgDescription: 'Continuous high definition live space exploration, rocket launches, and spacewalks from NASA.',
  },
  {
    id: 'ch-nasa-media',
    name: 'NASA TV Media Feed',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg',
    streamUrl: 'https://ntv2.akamaized.net/hls/live/2013923/NASA-NTV2-HLS/master.m3u8',
    category: 'Tech',
    country: 'USA / Tech 🚀',
    currentProgram: 'Mars Rover Imagery & Astronaut Briefings',
    epgDescription: 'Direct satellite mission feeds, telemetry broadcasts, and planetary science documentaries.',
  },
  {
    id: 'ch-inwonder-science',
    name: 'InWonder Science & Exploration 4K',
    logoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://amg00861-terninternation-inwonder-samsungau-1k63k.amagi.tv/playlist/amg00861-terninternation-inwonder-samsungau/playlist.m3u8',
    category: 'Tech',
    country: 'Tech & Science 🔬',
    currentProgram: 'Cosmic Wonders & Microscopic Universe',
    epgDescription: 'Stunning 4K science cinematography exploring quantum phenomena, space mysteries, and robotics.',
  },

  // --- NIGERIAN LIVE TV CHANNELS ---
  {
    id: 'ch-ng-silverbird',
    name: 'Silverbird News 24',
    logoUrl: 'https://i.imgur.com/9jcV9oG.png',
    streamUrl: 'https://viewmedia7219.bozztv.com/wmedia/viewmedia100/web_029/Stream/playlist.m3u8',
    category: 'News',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Silverbird Live Bulletin & Business Today',
    epgDescription: 'Premier Nigerian 24-hour national and African international news network.',
  },
  {
    id: 'ch-ng-wazobia-lagos',
    name: 'Wazobia Max TV Nigeria',
    logoUrl: 'https://i.imgur.com/IeioxBp.png',
    streamUrl: 'https://wazobia.live:8333/channel/wmax.m3u8',
    category: 'Entertainment',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Wazobia Express & Naija Comedy Live',
    epgDescription: 'Urban Nigerian entertainment, music countdowns, comedy shows, and dramas.',
  },
  {
    id: 'ch-ng-wazobia-ph',
    name: 'Wazobia Max TV Port Harcourt',
    logoUrl: 'https://rndcdn.dstv.com/dstvcms/2016/10/20/WazobiaMaz_new4-4logo_001_xlrg.png',
    streamUrl: 'https://wazobia.live:8333/channel/wmaxph.m3u8',
    category: 'Entertainment',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'South-South Spotlight & Highlife Hits',
    epgDescription: 'Regional cultural entertainment broadcast from Port Harcourt, Rivers State.',
  },
  {
    id: 'ch-ng-itage',
    name: 'Itage TV Nollywood Cinema',
    logoUrl: 'https://i.imgur.com/ojLIfkt.jpeg',
    streamUrl: 'https://viewmedia7219.bozztv.com/wmedia/viewmedia100/web_011/Stream/playlist.m3u8',
    category: 'Movies',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Nollywood Blockbusters & African Cinema',
    epgDescription: 'Continuous Nollywood movies, drama series, and celebrated West African cinematic productions.',
  },
  {
    id: 'ch-ng-superscreen',
    name: 'Superscreen TV Lagos',
    logoUrl: 'https://i.imgur.com/uTNmSWE.png',
    streamUrl: 'https://video1.getstreamhosting.com:1936/8398/8398/playlist.m3u8',
    category: 'Culture',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Lagos Today & Family Entertainment',
    epgDescription: 'Broadcasting from Victoria Island Lagos: Nollywood spotlight, culture, and family programming.',
  },
  {
    id: 'ch-ng-teleregency',
    name: 'Tele Regency TRTV',
    logoUrl: 'https://teleregency.tv/logo-white.png',
    streamUrl: 'https://streams.playtv.com.ng/Tele-Regency_TRTV/index.m3u8',
    category: 'News',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'National Headlines & African Horizons',
    epgDescription: 'Comprehensive nationwide news, business developments, and public affairs.',
  },
  {
    id: 'ch-ng-rave-tv',
    name: 'Rave TV Lagos',
    logoUrl: 'https://i.imgur.com/pXKQE0G.png',
    streamUrl: 'https://viewmedia7219.bozztv.com/wmedia/viewmedia100/web_039/Stream/playlist.m3u8',
    category: 'Entertainment',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'City Pulse Lagos & Youth Culture',
    epgDescription: 'Interactive, youth-oriented entertainment and lifestyle television station.',
  },
  {
    id: 'ch-ng-fortis-tv',
    name: 'Fortis TV Nigeria',
    logoUrl: 'https://i.imgur.com/HoO9Urd.jpg',
    streamUrl: 'https://stream.fortistv.com/hls/fortis-news/index.m3u8',
    category: 'General',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'African Current Affairs & Documentaries',
    epgDescription: 'Independent television broadcaster bringing contemporary news and cultural perspectives.',
  },
  {
    id: 'ch-ng-rapid-tv',
    name: 'Rapid TV Nigeria',
    logoUrl: 'https://i.imgur.com/FkMNcj1.jpeg',
    streamUrl: 'https://stream-hls.castr-cdn.com/6a05a899db0ebd344a759542/live_9655bc604f8211f19e748901a3f596d0/index.m3u8',
    category: 'General',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Rapid Afternoon Mix & Music Showcase',
    epgDescription: 'Fast-paced music, talk shows, and metropolitan news coverage.',
  },
  {
    id: 'ch-ng-nigbati',
    name: 'Nigbati TV (Yoruba)',
    logoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://viewmedia7219.bozztv.com/wmedia/viewmedia100/web_023/Stream/playlist.m3u8',
    category: 'Culture',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Asewo To Re Mecca & Yoruba Cultural Heritage',
    epgDescription: 'Indigenous Yoruba culture, folklore, language promotion, and traditional arts.',
  },
  {
    id: 'ch-ng-qausain',
    name: 'Qausain TV (Hausa)',
    logoUrl: 'https://i.ibb.co/N70QyQ7/Qausain-TV-logo.png',
    streamUrl: 'https://acasmedia3.acangroup.org/qausaintv/qausaintv_output/playlist.m3u8',
    category: 'Culture',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Labaran Duniya & Kannywood Cinema',
    epgDescription: 'Hausa language broadcasting covering Northern Nigeria, Niger, and West Africa.',
  },
  {
    id: 'ch-ng-acnn',
    name: 'ACNN TV Nigeria',
    logoUrl: 'https://i.imgur.com/91JLpxr.png',
    streamUrl: 'https://viewmedia7219.bozztv.com/wmedia/viewmedia100/web_014/Stream/playlist.m3u8',
    category: 'Religious',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Anglican Worldwide Service & Choral Praise',
    epgDescription: 'Anglican Cable Network Nigeria broadcasting spiritual guidance, faith, and uplifting music.',
  },
  {
    id: 'ch-ng-loveworldsat',
    name: 'LoveworldSAT Nigeria',
    logoUrl: 'https://i.imgur.com/Fg65XCS.png',
    streamUrl: 'https://cdnstack.internetmultimediaonline.org/lwsat/lwsat.stream/index.m3u8',
    category: 'Religious',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Your Loveworld Specials & Global Prayer',
    epgDescription: 'Global satellite television network delivering Christian programming and youth ministry.',
  },
  {
    id: 'ch-ng-hmtv',
    name: 'HMTV Nigeria',
    logoUrl: 'https://watchhmtv.com/hmtv_logo.svg',
    streamUrl: 'https://customer-yzxu6n447dx2x45h.cloudflarestream.com/f255a1e5ef17a8277e15e5f409951e98/manifest/video.m3u8',
    category: 'Music',
    country: 'Nigeria 🇳🇬',
    currentProgram: 'Afrobeats Non-Stop & Top 20 Hits',
    epgDescription: 'Non-stop Afrobeats music videos, chart-toppers, and artist spotlight from Lagos.',
  },

  // --- GLOBAL & US/UK CHANNELS ---
  {
    id: 'ch-dw-english',
    name: 'DW News 24/7',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Deutsche_Welle_symbol_2012.svg',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    category: 'News',
    country: 'Germany / Global 🇩🇪',
    currentProgram: 'Global NewsHour & Business Insights',
    epgDescription: 'Germany international broadcaster delivering worldwide news and investigative reports in English.',
  },
  {
    id: 'ch-bloomberg-quicktake',
    name: 'Bloomberg TV+',
    logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://liveproduseast.akamaized.net/us/Channel-USTV-AWS-virginia-1/Source-USTV-1000-1_live.m3u8',
    category: 'News',
    country: 'USA 🇺🇸',
    currentProgram: 'Market Wrap & Global Finance',
    epgDescription: '24/7 international business news, economic updates, and financial market analysis.',
  },
  {
    id: 'ch-cbs-news',
    name: 'CBS News 24/7',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/CBS_News.svg',
    streamUrl: 'https://cbsn-us.cbsnstream.cbsnews.com/out/v1/55a8648e8f134e82a470f83d562deeca/master.m3u8',
    category: 'News',
    country: 'USA 🇺🇸',
    currentProgram: 'America Decides & Evening News',
    epgDescription: 'Live national bulletins, breaking alerts, and investigative reporting from CBS News.',
  },
  {
    id: 'ch-abc-news-live',
    name: 'ABC News Live',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/ABC_News_logo_2021.svg',
    streamUrl: 'https://content.uplynk.com/channel/3324f2467c414329b3b0cc5cd987b6be.m3u8',
    category: 'News',
    country: 'USA 🇺🇸',
    currentProgram: 'Live Breaking News & Primetime',
    epgDescription: 'Real-time breaking news reports and special broadcasts from ABC News.',
  },
  {
    id: 'ch-sky-news',
    name: 'Sky News UK',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/30/Sky_News_logo_2015.svg',
    streamUrl: 'https://skynews-live.akamaized.net/hls/live/2011550/skynews_live1/index.m3u8',
    category: 'News',
    country: 'UK 🇬🇧',
    currentProgram: 'Sky News at Ten & Global View',
    epgDescription: 'Award-winning continuous news broadcasting from London and around the globe.',
  },
  {
    id: 'ch-nhk-world',
    name: 'NHK World-Japan',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/77/NHK_World-Japan_logo.svg',
    streamUrl: 'https://nhkworld.webcdn.stream.ne.jp/www11/nhkworld-tv/global/2003458/live.m3u8',
    category: 'News',
    country: 'Japan 🇯🇵',
    currentProgram: 'Newsline & Asian Lifestyle',
    epgDescription: 'English language international service of Japan public broadcaster NHK.',
  },
  {
    id: 'ch-france24-en',
    name: 'France 24 HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/France24_2013_logo.svg',
    streamUrl: 'https://static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8',
    category: 'News',
    country: 'France 🇫🇷',
    currentProgram: 'The World This Week',
    epgDescription: 'French international news network covering global perspectives from Paris.',
  },
  {
    id: 'ch-redbull-tv',
    name: 'Red Bull Action TV',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f5/RedBullTVLogo.svg',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    category: 'Sports',
    country: 'Global 🌍',
    currentProgram: 'Extreme Cliff Diving & Surfing World Series',
    epgDescription: 'Non-stop extreme sports tournaments, mountain biking, surfing, and motorsport documentaries.',
  },
  {
    id: 'ch-classical-cinema',
    name: 'Retro Cinema 24/7',
    logoUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=128&q=80',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'Movies',
    country: 'USA 🇺🇸',
    currentProgram: 'Golden Age Hollywood Restored Classics',
    epgDescription: 'Restored cinema, mystery thrillers, and vintage comedies around the clock.',
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
];

export const worldTvService = {
  // Fetch channels for a specific country with local cache fallback for low connectivity
  async fetchCountryChannels(countryCode: string): Promise<ChannelItem[]> {
    const country = WORLD_COUNTRIES.find((c) => c.code === countryCode) || WORLD_COUNTRIES[0];
    
    // Check offline / low connectivity cache first
    const cached = storageService.getCachedPlaylist(country.playlistUrl);

    try {
      const res = await fetch(country.playlistUrl, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const text = await res.text();
      const channels = parseM3UPlaylist(text);

      const enhanced = channels.slice(0, 80).map((ch) => ({
        ...ch,
        country: `${country.name} ${country.flag}`,
      }));

      // Cache for offline / low connectivity
      storageService.cachePlaylist(country.playlistUrl, enhanced);
      return enhanced;
    } catch (e) {
      console.warn(`Network fetch failed for ${country.name}. Using cache if available:`, e);
      if (cached && cached.length > 0) {
        return cached;
      }
      return [];
    }
  },

  // Fetch channels from IPTV-org or Free-TV with local cache fallback
  async fetchDirectoryPlaylist(directoryId: string): Promise<ChannelItem[]> {
    const dir = IPTV_ORG_DIRECTORIES.find((d) => d.id === directoryId);
    if (!dir) return [];

    const cached = storageService.getCachedPlaylist(dir.playlistUrl);

    try {
      const res = await fetch(dir.playlistUrl, { signal: AbortSignal.timeout(7000) });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const text = await res.text();
      const channels = parseM3UPlaylist(text);

      const enhanced = channels.slice(0, 100).map((ch) => ({
        ...ch,
        country: `${dir.name} ${dir.icon}`,
      }));

      storageService.cachePlaylist(dir.playlistUrl, enhanced);
      return enhanced;
    } catch (e) {
      console.warn(`Network fetch failed for ${dir.name}. Using cache if available:`, e);
      if (cached && cached.length > 0) {
        return cached;
      }
      return [];
    }
  },
};
