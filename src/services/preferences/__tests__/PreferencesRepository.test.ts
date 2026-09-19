import { describe, expect, it } from 'vitest';

import { createPreferencesRepository } from '../PreferencesRepository';
import type { StoryPreferences } from '../../../domain/story/types';

const preferences: StoryPreferences = {
  protagonist: 'Alma',
  age: 12,
  companions: [{ id: 'estrellita' }],
  environmentId: 'atico',
  magicItem: 'una pluma azul',
  valueId: 'curiosidad',
  toneId: 'mysterious',
  paragraphCount: 4,
  paragraphLength: 'long',
  fontId: 'marck',
};

describe('PreferencesRepository', () => {
  it('loads preferences saved on the device', async () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, value: string) => { values.set(key, value); },
    };
    const repository = createPreferencesRepository(storage);

    await repository.save(preferences);

    await expect(repository.load()).resolves.toEqual(preferences);
  });

  it('uses defaults when stored content is corrupt', async () => {
    const storage = {
      getItem: async () => '{not-json',
      setItem: async () => undefined,
    };
    const repository = createPreferencesRepository(storage);

    await expect(repository.load(preferences)).resolves.toEqual(preferences);
  });

  it('adds new default fields when loading preferences from an older app version', async () => {
    const legacyPreferences = {
      ...preferences,
      companionId: 'estrellita',
    } as Partial<StoryPreferences>;
    delete legacyPreferences.companions;
    delete legacyPreferences.customCompanion;
    delete legacyPreferences.customEnvironment;
    delete legacyPreferences.customValue;
    const storage = {
      getItem: async () => JSON.stringify(legacyPreferences),
      setItem: async () => undefined,
    };
    const repository = createPreferencesRepository(storage);
    const defaults: StoryPreferences = {
      ...preferences,
      customCompanion: '',
      customEnvironment: '',
      customValue: '',
    };

    await expect(repository.load(defaults)).resolves.toEqual(defaults);
  });

  it('migrates a legacy custom companion into the companion collection', async () => {
    const legacyPreferences = {
      ...preferences,
      companions: undefined,
      companionId: 'custom',
      customCompanion: 'mi abuela Luna',
    };
    const storage = {
      getItem: async () => JSON.stringify(legacyPreferences),
      setItem: async () => undefined,
    };
    const repository = createPreferencesRepository(storage);
    const defaults: StoryPreferences = {
      ...preferences,
      companions: [{ id: 'sapo-andres' }],
    };

    await expect(repository.load(defaults)).resolves.toMatchObject({
      companions: [{ id: 'custom', name: 'mi abuela Luna' }],
    });
  });
});
