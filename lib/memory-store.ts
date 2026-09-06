export interface DeviceRecord {
  id: string;
  pair_code: string;
  device_secret_hash: string;
  paired: boolean;
  station_slug: string | null;
  pair_code_expires_at: string;
  paired_at: string | null;
  pending_command: any | null;
  active_video_id: string | null;
  last_command_at: string | null;
  created_at: string;
  updated_at: string;
}

// Global in-memory storage fallback for local development or before DB migration
const globalDeviceStore = new Map<string, DeviceRecord>();

export const memoryDeviceStore = {
  getById(id: string): DeviceRecord | null {
    return globalDeviceStore.get(id) || null;
  },

  getByPairCode(code: string): DeviceRecord | null {
    const clean = code.toUpperCase().trim();
    for (const dev of globalDeviceStore.values()) {
      if (dev.pair_code === clean) {
        return dev;
      }
    }
    return null;
  },

  save(record: DeviceRecord): void {
    globalDeviceStore.set(record.id, record);
  },

  update(id: string, updates: Partial<DeviceRecord>): DeviceRecord | null {
    const existing = globalDeviceStore.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    globalDeviceStore.set(id, updated);
    return updated;
  },
};
