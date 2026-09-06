import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generateDeviceSecret, hashDeviceSecret } from '@/lib/device-auth';
import { generatePairCode } from '@/lib/pairing';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    let pairCode = generatePairCode(6);
    const deviceSecret = generateDeviceSecret();
    const secretHash = hashDeviceSecret(deviceSecret);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let inserted = false;
    let attempts = 0;
    let newDevice: any = null;

    while (!inserted && attempts < 5) {
      attempts++;
      const { data, error } = await supabaseAdmin
        .from('devices')
        .insert({
          pair_code: pairCode,
          device_secret_hash: secretHash,
          paired: false,
          pair_code_expires_at: expiresAt,
        })
        .select('id, pair_code, pair_code_expires_at')
        .single();

      if (!error && data) {
        inserted = true;
        newDevice = data;
      } else if (error && error.code === '23505') {
        pairCode = generatePairCode(6);
      } else {
        console.error('[Device Register] DB Insert Error:', error);
        return NextResponse.json({ error: 'Database registration failed' }, { status: 500 });
      }
    }

    if (!inserted || !newDevice) {
      return NextResponse.json({ error: 'Failed to allocate pairing code' }, { status: 500 });
    }

    return NextResponse.json({
      deviceId: newDevice.id,
      deviceSecret,
      pairCode: newDevice.pair_code,
      expiresAt: newDevice.pair_code_expires_at,
    });
  } catch (err: any) {
    console.error('[Device Register] Internal Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
