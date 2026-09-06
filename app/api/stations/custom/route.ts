import { NextRequest, NextResponse } from 'next/server';
import { StationDefinition, registerCustomStation, getAllStations } from '@/lib/stations';
import { resolveStationState } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawInput = (body?.handle || body?.url || body?.query || '').trim();
    const customTitle = body?.title;
    const bannerUrl = body?.bannerUrl;
    const logoUrl = body?.avatarUrl || body?.logoUrl;
    const category = body?.category || 'creator';

    if (!rawInput && !customTitle) {
      return NextResponse.json({ error: 'Please provide a channel name, handle, or URL' }, { status: 400 });
    }

    let handle = rawInput || (customTitle ? `@${customTitle.replace(/\s+/g, '')}` : '@creator');
    if (handle.includes('youtube.com/')) {
      const match = handle.match(/@(.*?)(?:\/|\?|$)/);
      if (match) {
        handle = '@' + match[1];
      }
    } else if (!handle.startsWith('@') && !handle.startsWith('UC')) {
      handle = '@' + handle;
    }

    const cleanSlug = 'custom-' + handle.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    const existingCount = getAllStations().length;

    const customStation: StationDefinition = {
      slug: cleanSlug,
      name: customTitle || `Channel ${handle}`,
      tagline: body?.description || `Continuous broadcast from ${handle}`,
      category: category,
      youtubeHandle: handle,
      mode: 'continuous',
      accentColor: body?.accentColor || '#E50914',
      channelNumber: existingCount + 1,
      backdropUrl: bannerUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=85&fit=crop',
      logoUrl: logoUrl,
    };

    registerCustomStation(customStation);
    const result = await resolveStationState(customStation);

    return NextResponse.json({
      success: true,
      station: customStation,
      state: result,
    });
  } catch (err: any) {
    console.error('[Custom Station API] Error:', err);
    return NextResponse.json({ error: 'Failed to resolve custom channel' }, { status: 500 });
  }
}
