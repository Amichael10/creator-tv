import { StationDefinition } from './stations';

interface CachedEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CachedEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setInCache<T>(key: string, data: T, ttlSeconds: number): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export interface VideoItem {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

export interface StationStatusResult {
  station: {
    slug: string;
    name: string;
    tagline?: string;
    category?: string;
    channelNumber?: number;
    accentColor?: string;
  };
  live: boolean;
  current: VideoItem | null;
  fallback: VideoItem[];
  source: 'api' | 'cache' | 'env_fallback' | 'mock';
  channelId: string;
}

// Curated default video IDs for reliable playback even without API keys
const DEFAULT_STATION_VIDEOS: Record<string, { current: VideoItem | null; fallback: VideoItem[] }> = {
  arise: {
    current: {
      videoId: 'live_placeholder_arise',
      title: 'ARISE News 24/7 International Live Broadcast',
      thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [
      {
        videoId: 'arise_top_stories',
        title: 'ARISE News: Prime Time News & Global Headlines',
        thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
  },
  'channels-tv': {
    current: {
      videoId: 'channels_live',
      title: 'Channels Television 24/7 Live Stream',
      thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [
      {
        videoId: 'channels_news_hour',
        title: 'The News Track - Channels TV Special',
        thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
  },
  'sky-news': {
    current: {
      videoId: 'sky_news_live',
      title: 'Sky News 24/7 Live Broadcast',
      thumbnail: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [
      {
        videoId: 'sky_world_news',
        title: 'Sky News Global World Report',
        thumbnail: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
  },
  'dw-news': {
    current: {
      videoId: 'dw_news_live',
      title: 'DW News Live - Global Insights & Breaking News',
      thumbnail: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [],
  },
  nasa: {
    current: {
      videoId: 'nasa_live_iss',
      title: 'NASA Live: Views of Earth from ISS & Deep Space',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [],
  },
  lofigirl: {
    current: {
      videoId: 'jfKfPfyJRdk', // Famous Lofi Girl livestream ID
      title: 'Lofi Girl: beats to relax/study to',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [],
  },
  chillhop: {
    current: {
      videoId: '5yx6BWlEVcY', // Chillhop livestream
      title: 'Chillhop Radio - Jazzy & Lofi Hip Hop Beats',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [],
  },
  mkbhd: {
    current: null,
    fallback: [
      {
        videoId: 'b5mN0eL_6oE',
        title: 'MKBHD: Smartphone Awards & Tech Deep Dive',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
      {
        videoId: 's416LgI6W5U',
        title: 'MKBHD: The Future of AI Hardware',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
  },
  veritasium: {
    current: null,
    fallback: [
      {
        videoId: '423xGvO0uW0',
        title: 'Veritasium: The Real Risk of Artificial Intelligence',
        thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
      {
        videoId: 'bHIhgxav9LY',
        title: 'Veritasium: How An Infinite Hotel Works',
        thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
  },
  kurzgesagt: {
    current: null,
    fallback: [
      {
        videoId: 'MBRqu0YOH14',
        title: 'Kurzgesagt: The Last Human on Earth',
        thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
      {
        videoId: 'sNhhvQGsMEc',
        title: 'Kurzgesagt: What If We Detonated All Nuclear Bombs at Once?',
        thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
  },
  mrbeast: {
    current: null,
    fallback: [
      {
        videoId: '0e3GPea1Tyg',
        title: 'MrBeast: We Survived The Most Extreme Places On Earth',
        thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
      {
        videoId: 'kX3nB4PpJko',
        title: 'MrBeast: 1,000 Blind People See For The First Time',
        thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
      {
        videoId: '9bqk6ZUsKyA',
        title: 'MrBeast: $1 vs $1,000,000 Hotel Room!',
        thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
  },
  aljazeera: {
    current: {
      videoId: 'gCNeDWCI0wo',
      title: 'Al Jazeera English 24/7 Live Stream',
      thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [],
  },
  bbc: {
    current: {
      videoId: 'live_bbc_news',
      title: 'BBC News 24/7 Global Live Broadcast',
      thumbnail: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [],
  },
  cnn: {
    current: {
      videoId: 'live_cnn_news',
      title: 'CNN International 24/7 Live Coverage',
      thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=640&q=80',
      publishedAt: new Date().toISOString(),
    },
    fallback: [],
  },
};

export async function resolveChannelId(apiKey: string, handle: string, fallbackId?: string): Promise<string> {
  const cacheKey = `channel_id_${handle}`;
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  if (fallbackId && !apiKey) {
    setInCache(cacheKey, fallbackId, 86400);
    return fallbackId;
  }

  const cleanHandle = handle.replace(/^@/, '');
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(cleanHandle)}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`YouTube API returned status ${res.status}`);
    }
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const channelId = data.items[0].id;
      setInCache(cacheKey, channelId, 86400);
      return channelId;
    }
  } catch (err) {
    console.error('[YouTube] Failed to resolve channel handle:', err);
  }

  return fallbackId || 'UCrkXEGnljz2r0U_yH6_p6rQ';
}

export async function getLiveStream(apiKey: string, channelId: string): Promise<VideoItem | null> {
  const cacheKey = `live_${channelId}`;
  const cached = getFromCache<VideoItem | null>(cacheKey);
  if (cached !== null) return cached;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[YouTube] Search Live API returned ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      const liveVideo: VideoItem = {
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        publishedAt: item.snippet.publishedAt,
      };
      setInCache(cacheKey, liveVideo, 60);
      return liveVideo;
    } else {
      setInCache(cacheKey, null, 45);
      return null;
    }
  } catch (err) {
    console.error('[YouTube] Error detecting livestream:', err);
    return null;
  }
}

export async function getRecentVideos(apiKey: string, channelId: string, limit: number = 6): Promise<VideoItem[]> {
  const cacheKey = `recent_${channelId}`;
  const cached = getFromCache<VideoItem[]>(cacheKey);
  if (cached) return cached;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${limit}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[YouTube] Recent Videos API returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    const videos: VideoItem[] = (data.items || []).map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
      publishedAt: item.snippet.publishedAt,
    }));

    setInCache(cacheKey, videos, 600);
    return videos;
  } catch (err) {
    console.error('[YouTube] Error fetching recent videos:', err);
    return [];
  }
}

export async function resolveStationState(station: StationDefinition): Promise<StationStatusResult> {
  const apiKey = process.env.YOUTUBE_API_KEY || '';

  const channelId = apiKey
    ? await resolveChannelId(apiKey, station.youtubeHandle, station.fallbackChannelId)
    : station.fallbackChannelId || 'UCrkXEGnljz2r0U_yH6_p6rQ';

  let liveVideo: VideoItem | null = null;
  let fallbackVideos: VideoItem[] = [];

  if (apiKey) {
    if (station.mode === 'live-first') {
      liveVideo = await getLiveStream(apiKey, channelId);
    }
    fallbackVideos = await getRecentVideos(apiKey, channelId, 6);
  } else {
    // Curated default fallback
    const defaults = DEFAULT_STATION_VIDEOS[station.slug];
    if (defaults) {
      liveVideo = defaults.current;
      fallbackVideos = defaults.fallback;
    } else {
      fallbackVideos = [
        {
          videoId: station.fallbackChannelId || 'placeholder',
          title: `${station.name} Broadcast`,
          thumbnail: '',
          publishedAt: new Date().toISOString(),
        },
      ];
    }
  }

  return {
    station: {
      slug: station.slug,
      name: station.name,
      tagline: station.tagline,
      category: station.category,
      channelNumber: station.channelNumber,
      accentColor: station.accentColor,
    },
    live: Boolean(liveVideo),
    current: liveVideo,
    fallback: fallbackVideos,
    source: apiKey ? 'api' : 'mock',
    channelId,
  };
}
