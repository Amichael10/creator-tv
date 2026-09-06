import { NextResponse } from 'next/server';
import { getAllStations, getStationsByCategory } from '@/lib/stations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stations = getAllStations();
    const categories = getStationsByCategory();

    return NextResponse.json({
      stations,
      categories,
      count: stations.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (err: any) {
    console.error('[Stations API] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve stations catalog' }, { status: 500 });
  }
}
