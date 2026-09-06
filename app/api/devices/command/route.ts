import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sanitizePairCode } from '@/lib/pairing';
import { isValidStation, getStation } from '@/lib/stations';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = body?.pairCode;
    const deviceId = body?.deviceId;
    const action = body?.action; // 'TUNE_STATION' | 'PLAY' | 'PAUSE' | 'NEXT' | 'MUTE'
    const payload = body?.payload || {};

    if (!action) {
      return NextResponse.json({ error: 'Missing command action' }, { status: 400 });
    }

    let query = supabaseAdmin.from('devices').select('id, paired, station_slug');
    if (deviceId) {
      query = query.eq('id', deviceId);
    } else if (rawCode) {
      const pairCode = sanitizePairCode(rawCode);
      query = query.eq('pair_code', pairCode);
    } else {
      return NextResponse.json({ error: 'Missing device identifier or pair code' }, { status: 400 });
    }

    const { data: device, error } = await query.single();
    if (error || !device) {
      return NextResponse.json({ error: 'Connected TV not found' }, { status: 404 });
    }

    const updateData: any = {
      pending_command: {
        id: Math.random().toString(36).substring(2, 9),
        action,
        payload,
        timestamp: Date.now(),
      },
      last_command_at: new Date().toISOString(),
    };

    if (action === 'TUNE_STATION' && payload.station) {
      const stationSlug = payload.station.toLowerCase().trim();
      if (isValidStation(stationSlug)) {
        updateData.station_slug = stationSlug;
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('devices')
      .update(updateData)
      .eq('id', device.id);

    if (updateError) {
      console.error('[Device Command API] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to dispatch command to TV' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action,
      station: updateData.station_slug ? getStation(updateData.station_slug) : undefined,
    });
  } catch (err: any) {
    console.error('[Device Command API] Error:', err);
    return NextResponse.json({ error: 'Internal server error dispatching command' }, { status: 500 });
  }
}
