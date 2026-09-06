import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sanitizePairCode, isValidPairCodeFormat } from '@/lib/pairing';
import { isValidStation, getStation } from '@/lib/stations';
import { memoryDeviceStore } from '@/lib/memory-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = body?.pairCode;
    const rawStation = body?.station;

    const pairCode = sanitizePairCode(rawCode);
    const stationSlug = (rawStation || '').toLowerCase().trim();

    if (!isValidPairCodeFormat(pairCode)) {
      return NextResponse.json({ error: 'Invalid pairing code format' }, { status: 400 });
    }

    if (!isValidStation(stationSlug)) {
      return NextResponse.json({ error: 'Unknown or unsupported station' }, { status: 400 });
    }

    let device: any = null;

    // 1. Try Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('devices')
        .select('id, paired, pair_code_expires_at')
        .eq('pair_code', pairCode)
        .single();

      if (!error && data) {
        device = data;
      }
    } catch (e) {}

    // 2. Fallback to memory store
    if (!device) {
      device = memoryDeviceStore.getByPairCode(pairCode);
    }

    if (!device) {
      return NextResponse.json({ error: 'That code could not be found. Please check your TV screen.' }, { status: 404 });
    }

    if (device.paired) {
      return NextResponse.json({ error: 'This television has already been connected.' }, { status: 409 });
    }

    const isExpired = new Date(device.pair_code_expires_at).getTime() < Date.now();
    if (isExpired) {
      return NextResponse.json({ error: 'That code has expired. Please check your TV screen.' }, { status: 410 });
    }

    // Update in Supabase & memory store
    try {
      await supabaseAdmin
        .from('devices')
        .update({
          paired: true,
          station_slug: stationSlug,
          paired_at: new Date().toISOString(),
        })
        .eq('id', device.id);
    } catch (e) {}

    memoryDeviceStore.update(device.id, {
      paired: true,
      station_slug: stationSlug,
      paired_at: new Date().toISOString(),
    });

    const station = getStation(stationSlug)!;

    return NextResponse.json({
      success: true,
      station: {
        slug: station.slug,
        name: station.name,
      },
    });
  } catch (err: any) {
    console.error('[Pair API] Internal Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
