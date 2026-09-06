import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generateDeviceSecret, hashDeviceSecret } from '@/lib/device-auth';
import { generatePairCode } from '@/lib/pairing';
import { memoryDeviceStore } from '@/lib/memory-store';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    let pairCode = generatePairCode(6);
    const deviceSecret = generateDeviceSecret();
    const secretHash = hashDeviceSecret(deviceSecret);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let inserted = false;
    let newDevice: any = null;

    // 1. Try Supabase first
    try {
      let attempts = 0;
      while (!inserted && attempts < 3) {
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
          break; // Fall through to memory store
        }
      }
    } catch (dbErr) {
      console.warn('[Device Register] Supabase unavailable, using in-memory store:', dbErr);
    }

    // 2. Seamless fallback to in-memory store if DB is not yet migrated
    if (!inserted || !newDevice) {
      const fallbackId = crypto.randomUUID();
      memoryDeviceStore.save({
        id: fallbackId,
        pair_code: pairCode,
        device_secret_hash: secretHash,
        paired: false,
        station_slug: null,
        pair_code_expires_at: expiresAt,
        paired_at: null,
        pending_command: null,
        active_video_id: null,
        last_command_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      newDevice = {
        id: fallbackId,
        pair_code: pairCode,
        pair_code_expires_at: expiresAt,
      };
    }

    return NextResponse.json({
      deviceId: newDevice.id,
      deviceSecret,
      pairCode: newDevice.pair_code,
      expiresAt: newDevice.pair_code_expires_at,
    });
  } catch (err: any) {
    console.error('[Device Register] Internal Error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
