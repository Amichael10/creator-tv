import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface ChannelSearchResult {
  channelId: string;
  title: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  description: string;
  subscriberCount?: string;
  category?: 'news' | 'tech' | 'music' | 'science' | 'creator' | 'entertainment';
}

// Extensive pre-indexed creator & broadcast directory for instant search
const PRESET_CHANNELS: ChannelSearchResult[] = [
  {
    channelId: 'UCrkXEGnljz2r0U_yH6_p6rQ',
    title: 'ARISE News',
    handle: '@arisenewschannel',
    avatarUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1920&q=85',
    description: '24-hour international news, politics, business and current affairs.',
    subscriberCount: '1.2M',
    category: 'news',
  },
  {
    channelId: 'UCvdTHv7eZk1U5Q0pL5v3VvQ',
    title: 'Channels Television',
    handle: '@ChannelsTelevision',
    avatarUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=85',
    description: 'Independent news and award-winning journalism from Nigeria.',
    subscriberCount: '2.5M',
    category: 'news',
  },
  {
    channelId: 'UCoMdktPbSTixAyNGwb-UYkQ',
    title: 'Sky News',
    handle: '@SkyNews',
    avatarUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1920&q=85',
    description: 'World news, breaking stories, and live video analysis.',
    subscriberCount: '7.8M',
    category: 'news',
  },
  {
    channelId: 'UCknLrEdhRCp1aegoMqRaCZg',
    title: 'DW News',
    handle: '@dwnews',
    avatarUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1920&q=85',
    description: 'Global insights and in-depth reporting from Deutsche Welle.',
    subscriberCount: '5.1M',
    category: 'news',
  },
  {
    channelId: 'UCaXkIU1QidjPwiAYu6GcHjg',
    title: 'Al Jazeera English',
    handle: '@AlJazeeraEnglish',
    avatarUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1920&q=85',
    description: 'Live news and analysis from around the world.',
    subscriberCount: '13.5M',
    category: 'news',
  },
  {
    channelId: 'UCupvZG-5ko_eiXAupbDfxWw',
    title: 'CNN',
    handle: '@CNN',
    avatarUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=85',
    description: 'Breaking news, live video, and international coverage.',
    subscriberCount: '16.8M',
    category: 'news',
  },
  {
    channelId: 'UC16niRr50-MSBwiO3YDb3RA',
    title: 'BBC News',
    handle: '@BBCNews',
    avatarUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1920&q=85',
    description: 'Trusted global news and in-depth investigations.',
    subscriberCount: '15.9M',
    category: 'news',
  },
  {
    channelId: 'UCLA_DiR1FfKNvjuUpBHmylQ',
    title: 'NASA Live',
    handle: '@NASA',
    avatarUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=85',
    description: 'Live space exploration, rocket launches, and ISS views.',
    subscriberCount: '12.4M',
    category: 'science',
  },
  {
    channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
    title: 'Lofi Girl',
    handle: '@LofiGirl',
    avatarUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=85',
    description: 'Relaxing 24/7 lofi hip hop radio to study, relax, and game to.',
    subscriberCount: '14.2M',
    category: 'music',
  },
  {
    channelId: 'UCOxqgCwgOq3EWHxNoUKlyYw',
    title: 'Chillhop Music',
    handle: '@ChillhopMusic',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=85',
    description: 'Jazzy and cozy lofi music broadcasts all day.',
    subscriberCount: '3.6M',
    category: 'music',
  },
  {
    channelId: 'UCBJycsmduvYEL83R_U4JriQ',
    title: 'Marques Brownlee (MKBHD)',
    handle: '@mkbhd',
    avatarUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=85',
    description: 'High-end tech reviews, hardware deep dives, and gadget analysis.',
    subscriberCount: '19.4M',
    category: 'tech',
  },
  {
    channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA',
    title: 'Veritasium',
    handle: '@veritasium',
    avatarUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1920&q=85',
    description: 'An element of truth - fascinating science, math, and experiments.',
    subscriberCount: '16.7M',
    category: 'science',
  },
  {
    channelId: 'UCsXVk37bltHxD1rDPwtNM8Q',
    title: 'Kurzgesagt – In a Nutshell',
    handle: '@kurzgesagt',
    avatarUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=85',
    description: 'Original animated science, philosophy, and cosmic deep dives.',
    subscriberCount: '22.8M',
    category: 'science',
  },
  {
    channelId: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
    title: 'Linus Tech Tips',
    handle: '@LinusTechTips',
    avatarUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=85',
    description: 'PC builds, tech tests, and crazy hardware experiments.',
    subscriberCount: '15.8M',
    category: 'tech',
  },
  {
    channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    title: 'MrBeast',
    handle: '@MrBeast',
    avatarUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=85',
    description: 'World-record entertainment, epic challenges, and spectacles.',
    subscriberCount: '340M',
    category: 'entertainment',
  },
  {
    channelId: 'UCsooa4yRKGN_zEE8iknghZA',
    title: 'TED',
    handle: '@TED',
    avatarUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=150&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1920&q=85',
    description: 'Ideas worth spreading - inspiring talks from global thought leaders.',
    subscriberCount: '24.1M',
    category: 'science',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query) {
      return NextResponse.json({ results: PRESET_CHANNELS.slice(0, 10) });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const cleanQuery = query.toLowerCase();

    // 1. Try YouTube Data API search if key is configured
    if (apiKey) {
      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=8&q=${encodeURIComponent(query)}&key=${apiKey}`;
        const searchRes = await fetch(searchUrl);

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const channelIds = (searchData.items || []).map((item: any) => item.id.channelId).filter(Boolean);

          if (channelIds.length > 0) {
            // Fetch branding details for high-res banner & handles
            const detailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings,statistics&id=${channelIds.join(',')}&key=${apiKey}`;
            const detailsRes = await fetch(detailsUrl);

            if (detailsRes.ok) {
              const detailsData = await detailsRes.json();
              const liveResults: ChannelSearchResult[] = (detailsData.items || []).map((item: any) => {
                const snip = item.snippet || {};
                const branding = item.brandingSettings || {};
                const stats = item.statistics || {};

                return {
                  channelId: item.id,
                  title: snip.title || 'Creator Channel',
                  handle: snip.customUrl ? `@${snip.customUrl.replace(/^@/, '')}` : `@${snip.title.replace(/\s+/g, '').toLowerCase()}`,
                  avatarUrl: snip.thumbnails?.high?.url || snip.thumbnails?.medium?.url || '',
                  bannerUrl: branding.image?.bannerExternalUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=85&fit=crop',
                  description: snip.description || '',
                  subscriberCount: stats.subscriberCount ? `${Math.round(stats.subscriberCount / 1000000 * 10) / 10}M` : undefined,
                  category: 'creator',
                };
              });

              if (liveResults.length > 0) {
                return NextResponse.json({
                  source: 'youtube_api',
                  results: liveResults,
                });
              }
            }
          }
        }
      } catch (ytErr) {
        console.warn('[Search API] YouTube API failed, falling back to pre-indexed catalog:', ytErr);
      }
    }

    // 2. Pre-indexed Catalog Fuzzy Search
    const matches = PRESET_CHANNELS.filter((ch) => {
      return (
        ch.title.toLowerCase().includes(cleanQuery) ||
        ch.handle.toLowerCase().includes(cleanQuery) ||
        ch.description.toLowerCase().includes(cleanQuery) ||
        ch.category?.toLowerCase().includes(cleanQuery)
      );
    });

    // If no direct matches, synthesize dynamic channel result from handle
    if (matches.length === 0) {
      const dynamicHandle = query.startsWith('@') ? query : `@${query}`;
      matches.push({
        channelId: `custom_${cleanQuery.replace(/[^a-z0-9]/g, '')}`,
        title: query.replace(/^@/, '').replace(/([A-Z])/g, ' $1').trim(),
        handle: dynamicHandle,
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=85&fit=crop',
        description: `Broadcast directly from YouTube creator ${dynamicHandle}`,
        category: 'creator',
      });
    }

    return NextResponse.json({
      source: 'catalog_fallback',
      results: matches,
    });
  } catch (err: any) {
    console.error('[Search API] Error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
