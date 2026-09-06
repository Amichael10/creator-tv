import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyDeviceSecret } from '@/lib/device-auth';
import { generatePairCode } from '@/lib/pairing';
import { getStation } from '@/lib/stations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.headers.get('x-creatortv-device-id');
    const deviceSecret = req.headers.get('x-creatortv-device-secret');

    if (!deviceId || !deviceSecret) {
      return NextResponse.json({ error: 'Missing device credentials' }, { status: 401 });
    }

    const { data: device, error } = await supabaseAdmin
      .from('devices')
      .select('id, device_secret_hash, paired, station_slug, pair_code, pair_code_expires_at, pending_command')
      .eq('id', deviceId)
      .single();

    if (error || !device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    if (!verifyDeviceSecret(deviceSecret, device.device_secret_hash)) {
      return NextResponse.json({ error: 'Invalid device credentials' }, { status: 403 });
    }

    if (device.paired && device.station_slug) {
      const station = getStation(device.station_slug);
      const pendingCommand = device.pending_command;

      // If there was a pending command, clear it atomically so it only triggers once on the TV
      if (pendingCommand) {
        await supabaseAdmin
          .from('devices')
          .update({ pending_command: null })
          .eq('id', device.id);
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

      await supabaseAdmin
        .from('devices')
        .update({
          pair_code: currentPairCode,
          pair_code_expires_at: currentExpiresAt,
        })
        .eq('id', device.id);
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
