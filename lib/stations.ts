export interface StationDefinition {
  slug: string;
  name: string;
  tagline: string;
  category: 'news' | 'tech' | 'music' | 'science' | 'creator';
  youtubeHandle: string;
  fallbackChannelId?: string;
  mode: 'live-first' | 'continuous' | 'scheduled';
  accentColor?: string;
  channelNumber?: number;
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
  },
  kurzgesagt: {
    slug: 'kurzgesagt',
    name: 'Kurzgesagt',
    tagline: 'Videos explaining things with optimistic nihilism and animation.',
    category: 'science',
    youtubeHandle: '@kurzgesagt',
    fallbackChannelId: 'UCsXVk37bltHxD1rDPwtNM8Q',
    mode: 'continuous',
    accentColor: '#8854D0',
    channelNumber: 10,
  },
};

export function getAllStations(): StationDefinition[] {
  return Object.values(STATIONS);
}

export function getStation(slug: string): StationDefinition | null {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  
  if (STATIONS[cleanSlug]) {
    return STATIONS[cleanSlug];
  }

  // Support custom slug pattern like "custom-mkbhd" or dynamic creator handle
  if (cleanSlug.startsWith('custom-')) {
    const handle = '@' + cleanSlug.replace('custom-', '');
    return {
      slug: cleanSlug,
      name: `Channel ${handle}`,
      tagline: `Continuous broadcast from ${handle}`,
      category: 'creator',
      youtubeHandle: handle,
      mode: 'continuous',
      accentColor: '#E50914',
      channelNumber: 99,
    };
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
  };

  getAllStations().forEach((station) => {
    if (grouped[station.category]) {
      grouped[station.category].push(station);
    }
  });

  return grouped;
}
