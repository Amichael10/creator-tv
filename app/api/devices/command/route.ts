import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sanitizePairCode } from '@/lib/pairing';
import { isValidStation, getStation } from '@/lib/stations';
import { memoryDeviceStore } from '@/lib/memory-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = body?.pairCode;
    const deviceId = body?.deviceId;
    const action = body?.action;
    const payload = body?.payload || {};

    if (!action) {
      return NextResponse.json({ error: 'Missing command action' }, { status: 400 });
    }

    let device: any = null;

    // 1. Try Supabase
    try {
      if (deviceId) {
        const { data, error } = await supabaseAdmin
          .from('devices')
          .select('id, paired, station_slug, pair_code')
          .eq('id', deviceId)
          .maybeSingle();
        if (!error && data) device = data;
      }

      if (!device && rawCode) {
        const pairCode = sanitizePairCode(rawCode);
        const { data, error } = await supabaseAdmin
          .from('devices')
          .select('id, paired, station_slug, pair_code')
          .ilike('pair_code', pairCode)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) device = data;
      }
    } catch (e: any) {
      console.warn('[Device Command API] Supabase error:', e?.message);
    }

    // 2. Fallback to memory store
    if (!device) {
      if (deviceId) {
        device = memoryDeviceStore.getById(deviceId);
      }
      if (!device && rawCode) {
        device = memoryDeviceStore.getByPairCode(sanitizePairCode(rawCode));
      }
    }

    if (!device) {
      return NextResponse.json({ error: 'Connected TV not found. Please reconnect with your TV code.' }, { status: 404 });
    }

    const commandObj = {
      id: Math.random().toString(36).substring(2, 9),
      action,
      payload,
      timestamp: Date.now(),
    };

    const updateData: any = {
      pending_command: commandObj,
      last_command_at: new Date().toISOString(),
    };

    if (action === 'TUNE_STATION' && payload.station) {
      const stationSlug = payload.station.toLowerCase().trim();
      if (isValidStation(stationSlug)) {
        updateData.station_slug = stationSlug;
      }
    }

    // Update in Supabase & memory store
    try {
      await supabaseAdmin
        .from('devices')
        .update(updateData)
        .eq('id', device.id);
    } catch (e) {}

    memoryDeviceStore.update(device.id, updateData);

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
