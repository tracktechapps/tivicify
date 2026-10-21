import { ChannelItem, EpgProgram } from '../types';

interface ProgramTemplate {
  title: string;
  durationMinutes: number;
  description: string;
}

const CATEGORY_SCHEDULES: Record<string, ProgramTemplate[]> = {
  news: [
    { title: 'Global News Morning Edition', durationMinutes: 60, description: 'Live breaking news, market updates, and worldwide coverage.' },
    { title: 'World In-Depth Report', durationMinutes: 60, description: 'Analysis and debates on top international events.' },
    { title: 'Prime Time News at Midday', durationMinutes: 60, description: 'Live reporting from global correspondents.' },
    { title: 'Focus on Africa & Global Economy', durationMinutes: 60, description: 'Economic updates and emerging African trends.' },
    { title: 'Evening News Hour Live', durationMinutes: 60, description: 'Comprehensive live evening broadcast.' },
    { title: 'Nightly World Review', durationMinutes: 60, description: 'End-of-day recap and preview of tomorrow.' },
  ],
  kids: [
    { title: 'Toon Express & Friends', durationMinutes: 45, description: 'Fun cartoons and colorful animations for kids.' },
    { title: 'Adventure Quest 3D', durationMinutes: 45, description: 'Exciting animated adventures for young explorers.' },
    { title: 'Classic Cartoon Hour', durationMinutes: 60, description: 'Timeless retro animation classics.' },
    { title: 'Creative Kids Science & Art', durationMinutes: 30, description: 'Educational and interactive creative show.' },
    { title: 'Super Hero Academy', durationMinutes: 45, description: 'Heroic animations with teamwork and courage.' },
    { title: 'Bedtime Toon Tales', durationMinutes: 45, description: 'Gentle animated stories for evening unwind.' },
  ],
  tech: [
    { title: 'NASA Space Mission Live', durationMinutes: 90, description: 'Live downlink feeds and planetary exploration.' },
    { title: 'Future Tech & AI Horizons', durationMinutes: 45, description: 'The next generation of robotics, computing, and AI.' },
    { title: 'Deep Ocean & Wildlife Discovery', durationMinutes: 60, description: 'High definition 4K nature and wildlife expedition.' },
    { title: 'Science Frontiers 360', durationMinutes: 60, description: 'Breakthrough physics, cosmology, and biotechnology.' },
  ],
  movies: [
    { title: 'Golden Era Cinema Spotlight', durationMinutes: 120, description: 'Restored high-definition classic film masterpiece.' },
    { title: 'Nollywood Prime Showcase', durationMinutes: 110, description: 'Top rated Nigerian drama and suspense cinema.' },
    { title: 'Late Night Mystery Feature', durationMinutes: 100, description: 'Classic mystery, thriller, and suspense drama.' },
  ],
  sports: [
    { title: 'World Sports Center Live', durationMinutes: 60, description: 'Scores, highlights, and international football.' },
    { title: 'Championship Moments', durationMinutes: 60, description: 'Legendary goals and athletic triumphs.' },
    { title: 'Match Analysis & Stadium Feed', durationMinutes: 60, description: 'Pre-match breakdown and expert analysis.' },
  ],
};

const DEFAULT_SCHEDULE: ProgramTemplate[] = [
  { title: 'Universal Broadcast Network Live', durationMinutes: 60, description: 'Live general entertainment, music, and features.' },
  { title: 'Global Showcase 24/7', durationMinutes: 60, description: 'Varied programming from around the world.' },
];

export const epgService = {
  getProgramForChannel(channel: ChannelItem): { current: EpgProgram; upNext: EpgProgram } {
    const catLower = (channel.category || '').toLowerCase();
    const nameLower = (channel.name || '').toLowerCase();

    let templates = DEFAULT_SCHEDULE;
    if (nameLower.includes('arise')) {
      templates = [
        { title: 'The Morning Show with Reuben Abati', durationMinutes: 60, description: 'Debate, breaking politics, and in-depth national analysis.' },
        { title: 'Arise NewsHour Live', durationMinutes: 60, description: 'Live reporting from Abuja, Lagos, London, and New York studios.' },
        { title: 'Prime Time News & World Update', durationMinutes: 60, description: 'Top headline stories, financial markets, and African coverage.' },
        { title: 'NewsNight Africa Focus', durationMinutes: 60, description: 'In-depth investigative reports and political interviews.' },
      ];
    } else if (nameLower.includes('ait')) {
      templates = [
        { title: 'Kakaaki: The African Voice', durationMinutes: 60, description: 'Nigeria celebrated morning breakfast show and political analysis.' },
        { title: 'AIT News at 8 Live', durationMinutes: 60, description: 'Comprehensive national bulletin from DAAR Communications.' },
        { title: 'Democracy Today & The Public Eye', durationMinutes: 60, description: 'Discussions on national governance and policy reform.' },
      ];
    } else if (nameLower.includes('africa magic') || nameLower.includes('nollywood')) {
      templates = [
        { title: 'Nollywood Blockbuster: Prime Cinema', durationMinutes: 120, description: 'Celebrated African cinematic feature starring top Nollywood stars.' },
        { title: 'Tinsel & African Dramatic Series', durationMinutes: 60, description: 'Gripping drama, romance, and boardroom intrigue across Lagos.' },
        { title: 'African Magic Showcase Spotlight', durationMinutes: 90, description: 'Exclusive African films, comedies, and cultural storytelling.' },
      ];
    } else if (nameLower.includes('supersport') || nameLower.includes('fifa') || nameLower.includes('sport')) {
      templates = [
        { title: 'Premier League Matchday & World Football Live', durationMinutes: 90, description: 'Live match broadcast, halftime tactical analysis and goals.' },
        { title: 'World Sports Center & Football Highlights', durationMinutes: 60, description: 'Roundup of European, African, and international leagues.' },
        { title: 'Championship Spotlight & Press Conference', durationMinutes: 60, description: 'Interviews with star players and coaches before kickoff.' },
      ];
    } else if (nameLower.includes('ontv') || nameLower.includes('soundcity') || nameLower.includes('rave')) {
      templates = [
        { title: 'City Pulse & Urban Lifestyle Live', durationMinutes: 60, description: 'Fashion, youth culture, entertainment news, and Lagos trends.' },
        { title: 'Afrobeats Top 10 Countdown', durationMinutes: 60, description: 'Chart-topping Nigerian and international Afrobeats hits.' },
        { title: 'Lagos Comedy Club & Drama Series', durationMinutes: 60, description: 'Humorous sketches and popular Nigerian comedy series.' },
      ];
    } else if (catLower.includes('kid') || catLower.includes('animation') || nameLower.includes('cartoon') || nameLower.includes('abc kids')) {
      templates = CATEGORY_SCHEDULES.kids;
    } else if (catLower.includes('news') || nameLower.includes('news') || nameLower.includes('cnn') || nameLower.includes('bbc')) {
      templates = CATEGORY_SCHEDULES.news;
    } else if (catLower.includes('tech') || catLower.includes('science') || nameLower.includes('nasa') || nameLower.includes('discovery')) {
      templates = CATEGORY_SCHEDULES.tech;
    } else if (catLower.includes('movie') || nameLower.includes('cinema')) {
      templates = CATEGORY_SCHEDULES.movies;
    } else if (catLower.includes('sport')) {
      templates = CATEGORY_SCHEDULES.sports;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const totalDayMinutes = currentHour * 60 + currentMinute;

    // Deterministic selection based on channel ID hash + current time
    let charSum = 0;
    for (let i = 0; i < channel.id.length; i++) {
      charSum += channel.id.charCodeAt(i);
    }

    const programIndex = Math.floor((totalDayMinutes + charSum * 13) / 60) % templates.length;
    const nextProgramIndex = (programIndex + 1) % templates.length;

    const currentTemplate = templates[programIndex];
    const nextTemplate = templates[nextProgramIndex];

    // Compute progress within the current hour slot
    const slotMinute = (totalDayMinutes + charSum * 13) % 60;
    const progressPercent = Math.min(100, Math.max(5, Math.floor((slotMinute / 60) * 100)));
    const remainingMinutes = Math.max(1, 60 - slotMinute);

    const startHour = (currentHour) % 24;
    const endHour = (currentHour + 1) % 24;

    const formatHour = (h: number) => `${h < 10 ? '0' : ''}${h}:00`;

    return {
      current: {
        title: channel.currentProgram || currentTemplate.title,
        start: formatHour(startHour),
        end: formatHour(endHour),
        description: channel.epgDescription || currentTemplate.description,
        progressPercent,
        remainingMinutes,
      },
      upNext: {
        title: nextTemplate.title,
        start: formatHour(endHour),
        end: formatHour((endHour + 1) % 24),
        description: nextTemplate.description,
        progressPercent: 0,
        remainingMinutes: 60,
      },
    };
  },
};
