import { describe, expect, it } from 'vitest';

import { createInstallationRepository } from '../InstallationRepository';

describe('InstallationRepository', () => {
  it('creates an installation id once and reuses it on later launches', async () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, value: string) => { values.set(key, value); },
    };
    const repository = createInstallationRepository(storage, () => 'device-generated-once');

    await expect(repository.getOrCreate()).resolves.toBe('device-generated-once');
    await expect(repository.getOrCreate()).resolves.toBe('device-generated-once');
    expect(values.size).toBe(1);
  });
});
