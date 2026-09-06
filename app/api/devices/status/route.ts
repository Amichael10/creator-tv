import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyDeviceSecret } from '@/lib/device-auth';
import { generatePairCode } from '@/lib/pairing';
import { getStation } from '@/lib/stations';
import { memoryDeviceStore } from '@/lib/memory-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.headers.get('x-creatortv-device-id');
    const deviceSecret = req.headers.get('x-creatortv-device-secret');

    if (!deviceId || !deviceSecret) {
      return NextResponse.json({ error: 'Missing device credentials' }, { status: 401 });
    }

    let device: any = null;

    // 1. Try Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('devices')
        .select('id, device_secret_hash, paired, station_slug, pair_code, pair_code_expires_at, pending_command')
        .eq('id', deviceId)
        .single();

      if (!error && data) {
        device = data;
      }
    } catch (dbErr) {
      // ignore, fall to memory store
    }

    // 2. Fallback to memory store
    if (!device) {
      device = memoryDeviceStore.getById(deviceId);
    }

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    if (!verifyDeviceSecret(deviceSecret, device.device_secret_hash)) {
      return NextResponse.json({ error: 'Invalid device credentials' }, { status: 403 });
    }

    if (device.paired && device.station_slug) {
      const station = getStation(device.station_slug);
      const pendingCommand = device.pending_command;

      // Clear pending command after dispatch
      if (pendingCommand) {
        try {
          await supabaseAdmin
            .from('devices')
            .update({ pending_command: null })
            .eq('id', device.id);
        } catch (e) {}
        memoryDeviceStore.update(device.id, { pending_command: null });
      }

      return NextResponse.json({
        paired: true,
        station: station
          ? {
              slug: station.slug,
              name: station.name,
              tagline: station.tagline,
              category: station.category,
              channelNumber: station.channelNumber,
              accentColor: station.accentColor,
              mode: station.mode,
            }
          : {
              slug: device.station_slug,
              name: 'Channel ' + device.station_slug,
              mode: 'live-first',
            },
        command: pendingCommand || null,
      });
    }

    const isExpired = new Date(device.pair_code_expires_at).getTime() < Date.now();
    let currentPairCode = device.pair_code;
    let currentExpiresAt = device.pair_code_expires_at;

    if (isExpired) {
      currentPairCode = generatePairCode(6);
      currentExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      try {
        await supabaseAdmin
          .from('devices')
          .update({
            pair_code: currentPairCode,
            pair_code_expires_at: currentExpiresAt,
          })
          .eq('id', device.id);
      } catch (e) {}
      memoryDeviceStore.update(device.id, {
        pair_code: currentPairCode,
        pair_code_expires_at: currentExpiresAt,
      });
    }

    return NextResponse.json({
      paired: false,
      pairCode: currentPairCode,
      expiresAt: currentExpiresAt,
      command: null,
    });
  } catch (err: any) {
    console.error('[Device Status] Internal Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
