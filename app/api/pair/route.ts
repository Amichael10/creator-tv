import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sanitizePairCode, isValidPairCodeFormat } from '@/lib/pairing';
import { isValidStation, getStation } from '@/lib/stations';

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

    const { data: device, error } = await supabaseAdmin
      .from('devices')
      .select('id, paired, pair_code_expires_at')
      .eq('pair_code', pairCode)
      .single();

    if (error || !device) {
      return NextResponse.json({ error: 'That code could not be found.' }, { status: 404 });
    }

    if (device.paired) {
      return NextResponse.json({ error: 'This television has already been connected.' }, { status: 409 });
    }

    const isExpired = new Date(device.pair_code_expires_at).getTime() < Date.now();
    if (isExpired) {
      return NextResponse.json({ error: 'That code has expired. Please check your TV screen.' }, { status: 410 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('devices')
      .update({
        paired: true,
        station_slug: stationSlug,
        paired_at: new Date().toISOString(),
      })
      .eq('id', device.id);

    if (updateError) {
      console.error('[Pair API] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to pair device' }, { status: 500 });
    }

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
