import { NextRequest, NextResponse } from 'next/server';
import { StationDefinition } from '@/lib/stations';
import { resolveStationState } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawInput = (body?.handle || body?.url || '').trim();

    if (!rawInput) {
      return NextResponse.json({ error: 'Please provide a YouTube handle or URL' }, { status: 400 });
    }

    // Extract handle or clean name
    let handle = rawInput;
    if (handle.includes('youtube.com/')) {
      const match = handle.match(/@(.*?)(?:\/|\?|$)/);
      if (match) {
        handle = '@' + match[1];
      }
    } else if (!handle.startsWith('@') && !handle.startsWith('UC')) {
      handle = '@' + handle;
    }

    const cleanSlug = 'custom-' + handle.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();

    const customStation: StationDefinition = {
      slug: cleanSlug,
      name: `Channel ${handle}`,
      tagline: `Direct creator channel for ${handle}`,
      category: 'creator',
      youtubeHandle: handle,
      mode: 'continuous',
      accentColor: '#E50914',
      channelNumber: 99,
    };

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
