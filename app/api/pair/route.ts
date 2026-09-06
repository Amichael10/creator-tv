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
    const rawDeviceId = body?.deviceId;
    const rawStation = body?.station || 'arise';

    const pairCode = rawCode ? sanitizePairCode(rawCode) : '';
    const stationSlug = (rawStation || 'arise').toLowerCase().trim();

    if (!rawDeviceId && !isValidPairCodeFormat(pairCode)) {
      return NextResponse.json({ error: 'Please enter a valid 6-character code.' }, { status: 400 });
    }

    let device: any = null;

    // 1. Try Supabase (by deviceId or case-insensitive pairCode)
    try {
      if (rawDeviceId) {
        const { data, error } = await supabaseAdmin
          .from('devices')
          .select('id, paired, pair_code, pair_code_expires_at, station_slug')
          .eq('id', rawDeviceId)
          .maybeSingle();

        if (!error && data) {
          device = data;
        }
      }

      if (!device && pairCode && isValidPairCodeFormat(pairCode)) {
        const { data, error } = await supabaseAdmin
          .from('devices')
          .select('id, paired, pair_code, pair_code_expires_at, station_slug')
          .ilike('pair_code', pairCode)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          device = data;
        } else if (error) {
          console.warn('[Pair API] Supabase query error:', error.message || error);
        }
      }
    } catch (e: any) {
      console.warn('[Pair API] Supabase exception:', e?.message);
    }

    // 2. Fallback to memory store
    if (!device) {
      if (rawDeviceId) {
        device = memoryDeviceStore.getById(rawDeviceId);
      }
      if (!device && pairCode) {
        device = memoryDeviceStore.getByPairCode(pairCode);
      }
    }

    if (!device) {
      return NextResponse.json(
        { error: 'Pairing code not found. Please ensure the code on your TV screen matches.' },
        { status: 404 }
      );
    }

    const commandObj = {
      id: Math.random().toString(36).substring(2, 9),
      action: 'TUNE_STATION',
      payload: { station: stationSlug },
      timestamp: Date.now(),
    };

    const updatePayload = {
      paired: true,
      station_slug: stationSlug,
      paired_at: new Date().toISOString(),
      pending_command: commandObj,
      last_command_at: new Date().toISOString(),
    };

    // Update in Supabase & memory store (never reject already paired TV)
    try {
      const { error: updateErr } = await supabaseAdmin
        .from('devices')
        .update(updatePayload)
        .eq('id', device.id);
      if (updateErr) {
        console.warn('[Pair API] Supabase update warning:', updateErr.message);
      }
    } catch (e: any) {
      console.warn('[Pair API] Supabase update exception:', e?.message);
    }

    memoryDeviceStore.update(device.id, updatePayload);

    const station = getStation(stationSlug) || {
      slug: stationSlug,
      name: 'Channel ' + stationSlug,
      tagline: 'Broadcast Station',
      category: 'creator',
      youtubeHandle: '',
      mode: 'continuous',
    };

    return NextResponse.json({
      success: true,
      deviceId: device.id,
      station: {
        slug: station.slug,
        name: station.name,
        tagline: station.tagline,
        category: station.category,
      },
    });
  } catch (err: any) {
    console.error('[Pair API] Internal Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
