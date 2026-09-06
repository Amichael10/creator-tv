import { NextResponse } from 'next/server';
import { STATIONS } from '@/lib/stations';
import { resolveStationState } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const station = STATIONS.arise;
    const result = await resolveStationState(station);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (err: any) {
    console.error('[Station ARISE API] Error:', err);
    return NextResponse.json({ error: 'Failed to resolve ARISE station state' }, { status: 500 });
  }
}
