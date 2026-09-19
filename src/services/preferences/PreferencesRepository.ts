import type { StoryPreferences } from '../../domain/story/types';

const STORAGE_KEY = 'el-jardin-secreto:preferences:v1';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

function migrateCompanions(
  storedPreferences: StoryPreferences,
  defaults?: StoryPreferences,
): StoryPreferences['companions'] {
  if (storedPreferences.companions?.length) return storedPreferences.companions;
  if (storedPreferences.companionId === 'custom' && storedPreferences.customCompanion?.trim()) {
    return [{ id: 'custom', name: storedPreferences.customCompanion.trim() }];
  }
  if (storedPreferences.companionId) return [{ id: storedPreferences.companionId }];
  return defaults?.companions;
}

export function createPreferencesRepository(storage: KeyValueStorage) {
  return {
    async load(defaults?: StoryPreferences): Promise<StoryPreferences | undefined> {
      try {
        const value = await storage.getItem(STORAGE_KEY);
        if (!value) return defaults;
        const storedPreferences = JSON.parse(value) as StoryPreferences;
        const {
          companionId: _legacyCompanionId,
          customCompanion: _legacyCustomCompanion,
          ...currentPreferences
        } = storedPreferences;
        return {
          ...defaults,
          ...currentPreferences,
          companions: migrateCompanions(storedPreferences, defaults),
        };
      } catch {
        return defaults;
      }
    },
    async save(preferences: StoryPreferences): Promise<void> {
      await storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    },
  };
}
