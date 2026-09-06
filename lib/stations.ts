export interface StationDefinition {
  slug: string;
  name: string;
  tagline: string;
  category: 'news' | 'tech' | 'music' | 'science' | 'creator' | 'entertainment';
  youtubeHandle: string;
  fallbackChannelId?: string;
  mode: 'live-first' | 'continuous' | 'scheduled';
  accentColor?: string;
  channelNumber?: number;
  backdropUrl?: string;
  logoUrl?: string;
}

export const STATIONS: Record<string, StationDefinition> = {
  arise: {
    slug: 'arise',
    name: 'ARISE News',
    tagline: '24-hour news, politics, business and current affairs broadcast globally.',
    category: 'news',
    youtubeHandle: '@arisenewschannel',
    fallbackChannelId: process.env.ARISE_YOUTUBE_CHANNEL_ID || 'UCrkXEGnljz2r0U_yH6_p6rQ',
    mode: 'live-first',
    accentColor: '#E50914',
    channelNumber: 1,
    backdropUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1920&q=85&fit=crop',
    logoUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_kM3y2sW8Bf4v0S0q7zK3B6G6_p1x2q3=s176-c-k-c0x00ffffff-no-rj',
  },
  'channels-tv': {
    slug: 'channels-tv',
    name: 'Channels TV',
    tagline: 'Nigeria’s multi-award winning independent news station.',
    category: 'news',
    youtubeHandle: '@ChannelsTelevision',
    fallbackChannelId: 'UCvdTHv7eZk1U5Q0pL5v3VvQ',
    mode: 'live-first',
    accentColor: '#0066CC',
    channelNumber: 2,
    backdropUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=85&fit=crop',
  },
  'sky-news': {
    slug: 'sky-news',
    name: 'Sky News',
    tagline: 'World news, breaking stories, and top headlines 24/7.',
    category: 'news',
    youtubeHandle: '@SkyNews',
    fallbackChannelId: 'UCoMdktPbSTixAyNGwb-UYkQ',
    mode: 'live-first',
    accentColor: '#FF3300',
    channelNumber: 3,
    backdropUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1920&q=85&fit=crop',
  },
  'dw-news': {
    slug: 'dw-news',
    name: 'DW News',
    tagline: 'In-depth global reporting and analysis from Deutsche Welle.',
    category: 'news',
    youtubeHandle: '@dwnews',
    fallbackChannelId: 'UCknLrEdhRCp1aegoMqRaCZg',
    mode: 'live-first',
    accentColor: '#0099FF',
    channelNumber: 4,
    backdropUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1920&q=85&fit=crop',
  },
  nasa: {
    slug: 'nasa',
    name: 'NASA Live',
    tagline: 'Live rocket launches, spacewalks, and Earth views from the ISS.',
    category: 'science',
    youtubeHandle: '@NASA',
    fallbackChannelId: 'UCLA_DiR1FfKNvjuUpBHmylQ',
    mode: 'live-first',
    accentColor: '#0B3D91',
    channelNumber: 5,
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=85&fit=crop',
  },
  lofigirl: {
    slug: 'lofigirl',
    name: 'Lofi Girl',
    tagline: 'Relaxing lofi hip hop radio - beats to study/relax/game to.',
    category: 'music',
    youtubeHandle: '@LofiGirl',
    fallbackChannelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
    mode: 'live-first',
    accentColor: '#FF6B6B',
    channelNumber: 6,
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=85&fit=crop',
  },
  chillhop: {
    slug: 'chillhop',
    name: 'Chillhop Music',
    tagline: 'Chill beats, jazzy vibes, and continuous relaxing music radio.',
    category: 'music',
    youtubeHandle: '@ChillhopMusic',
    fallbackChannelId: 'UCOxqgCwgOq3EWHxNoUKlyYw',
    mode: 'live-first',
    accentColor: '#F7B731',
    channelNumber: 7,
    backdropUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=85&fit=crop',
  },
  mkbhd: {
    slug: 'mkbhd',
    name: 'MKBHD Tech TV',
    tagline: 'Crisp tech reviews, smartphone spotlights, and gadget deep dives.',
    category: 'tech',
    youtubeHandle: '@mkbhd',
    fallbackChannelId: 'UCBJycsmduvYEL83R_U4JriQ',
    mode: 'continuous',
    accentColor: '#FF2A2A',
    channelNumber: 8,
    backdropUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=85&fit=crop',
  },
  veritasium: {
    slug: 'veritasium',
    name: 'Veritasium',
    tagline: 'An element of truth - incredible science, physics and history.',
    category: 'science',
    youtubeHandle: '@veritasium',
    fallbackChannelId: 'UCHnyfMqiRRG1u-2MsSQLbXA',
    mode: 'continuous',
    accentColor: '#20BF6B',
    channelNumber: 9,
    backdropUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1920&q=85&fit=crop',
  },
  kurzgesagt: {
    slug: 'kurzgesagt',
    name: 'Kurzgesagt',
    tagline: 'Videos explaining science, philosophy, and the universe.',
    category: 'science',
    youtubeHandle: '@kurzgesagt',
    fallbackChannelId: 'UCsXVk37bltHxD1rDPwtNM8Q',
    mode: 'continuous',
    accentColor: '#8854D0',
    channelNumber: 10,
    backdropUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=85&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200&q=80',
  },
  mrbeast: {
    slug: 'mrbeast',
    name: 'MrBeast TV',
    tagline: 'World-record entertainment, massive challenges, and spectacles.',
    category: 'entertainment',
    youtubeHandle: '@MrBeast',
    fallbackChannelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    mode: 'continuous',
    accentColor: '#00A8FF',
    channelNumber: 11,
    backdropUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=85&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&q=80',
  },
  aljazeera: {
    slug: 'aljazeera',
    name: 'Al Jazeera English',
    tagline: 'Live international news, geopolitics, and world analysis.',
    category: 'news',
    youtubeHandle: '@AlJazeeraEnglish',
    fallbackChannelId: 'UCaXkIU1QidjPwiAYu6GcHjg',
    mode: 'live-first',
    accentColor: '#E67E22',
    channelNumber: 12,
    backdropUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1920&q=85&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200&q=80',
  },
  bbc: {
    slug: 'bbc',
    name: 'BBC News',
    tagline: 'Trusted global news and in-depth investigations.',
    category: 'news',
    youtubeHandle: '@BBCNews',
    fallbackChannelId: 'UC16niRr50-MSBwiO3YDb3RA',
    mode: 'live-first',
    accentColor: '#BB1919',
    channelNumber: 13,
    backdropUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1920&q=85&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=200&q=80',
  },
  cnn: {
    slug: 'cnn',
    name: 'CNN International',
    tagline: 'Breaking news, live video, and international coverage.',
    category: 'news',
    youtubeHandle: '@CNN',
    fallbackChannelId: 'UCupvZG-5ko_eiXAupbDfxWw',
    mode: 'live-first',
    accentColor: '#CC0000',
    channelNumber: 14,
    backdropUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=85&fit=crop',
    logoUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=80',
  },
};

// In-memory dynamic custom stations added by users during runtime
const dynamicCustomStations = new Map<string, StationDefinition>();

export function registerCustomStation(station: StationDefinition): void {
  dynamicCustomStations.set(station.slug.toLowerCase(), station);
}

export function getAllStations(): StationDefinition[] {
  const presets = Object.values(STATIONS);
  const custom = Array.from(dynamicCustomStations.values());
  return [...presets, ...custom];
}

export function getStation(slug: string): StationDefinition | null {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  
  if (STATIONS[cleanSlug]) {
    return STATIONS[cleanSlug];
  }

  if (dynamicCustomStations.has(cleanSlug)) {
    return dynamicCustomStations.get(cleanSlug)!;
  }

  // Support dynamic on-the-fly slug pattern like "custom-mkbhd"
  if (cleanSlug.startsWith('custom-')) {
    const handle = '@' + cleanSlug.replace('custom-', '');
    const dynamicStation: StationDefinition = {
      slug: cleanSlug,
      name: `Channel ${handle}`,
      tagline: `Continuous broadcast from ${handle}`,
      category: 'creator',
      youtubeHandle: handle,
      mode: 'continuous',
      accentColor: '#E50914',
      channelNumber: 99,
      backdropUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=85&fit=crop',
    };
    dynamicCustomStations.set(cleanSlug, dynamicStation);
    return dynamicStation;
  }

  return null;
}

export function isValidStation(slug: string): boolean {
  return Boolean(getStation(slug));
}

export function getStationsByCategory(): Record<string, StationDefinition[]> {
  const grouped: Record<string, StationDefinition[]> = {
    news: [],
    science: [],
    music: [],
    tech: [],
    creator: [],
    entertainment: [],
  };

  getAllStations().forEach((station) => {
    if (grouped[station.category]) {
      grouped[station.category].push(station);
    } else {
      if (!grouped.creator) grouped.creator = [];
      grouped.creator.push(station);
    }
  });

  return grouped;
}
