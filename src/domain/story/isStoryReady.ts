import type { StoryPreferences } from './types';

function hasCustomValue(selectionId: string, customValue: string | undefined): boolean {
  return selectionId !== 'custom' || Boolean(customValue?.trim());
}

function hasCompanion(preferences: StoryPreferences): boolean {
  if (preferences.companions) {
    return preferences.companions.some(({ id, name }) => id !== 'custom' || Boolean(name?.trim()));
  }
  const legacyCompanionId = preferences.companionId;
  if (!legacyCompanionId) return false;
  return hasCustomValue(legacyCompanionId, preferences.customCompanion);
}

export function isStoryReady(preferences: StoryPreferences): boolean {
  return Boolean(preferences.protagonist.trim())
    && Boolean(preferences.magicItem.trim())
    && hasCompanion(preferences)
    && hasCustomValue(preferences.environmentId, preferences.customEnvironment)
    && hasCustomValue(preferences.valueId, preferences.customValue);
}
