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
        videoId: 'mkbhd_latest',
        title: 'MKBHD: The Ultimate Smartphone Review & Deep Dive',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
  },
  veritasium: {
    current: null,
    fallback: [
      {
        videoId: 'veritasium_latest',
        title: 'Veritasium: The Most Astonishing Scientific Discovery',
        thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
  },
  kurzgesagt: {
    current: null,
    fallback: [
      {
        videoId: 'kurzgesagt_latest',
        title: 'Kurzgesagt: What If the Universe is Not What It Seems?',
        thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=640&q=80',
        publishedAt: new Date().toISOString(),
      },
    ],
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
