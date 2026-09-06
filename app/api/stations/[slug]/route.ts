import { NextRequest, NextResponse } from 'next/server';
import { getStation } from '@/lib/stations';
import { resolveStationState } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const station = getStation(slug);

    if (!station) {
      return NextResponse.json({ error: `Station '${slug}' not found` }, { status: 404 });
    }

    const result = await resolveStationState(station);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (err: any) {
    console.error('[Station Dynamic API] Error:', err);
    return NextResponse.json({ error: 'Failed to resolve station state' }, { status: 500 });
  }
}
