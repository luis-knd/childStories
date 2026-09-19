import { describe, expect, it } from 'vitest';

import { createSurprisePreferences } from '../createSurprisePreferences';

describe('createSurprisePreferences', () => {
  it('returns complete preferences using catalog values', () => {
    const preferences = createSurprisePreferences(8);

    expect(preferences.protagonist.length).toBeGreaterThan(0);
    expect(preferences.age).toBeGreaterThanOrEqual(3);
    expect(preferences.age).toBeLessThanOrEqual(15);
    expect(preferences.magicItem.length).toBeGreaterThan(0);
    expect(preferences.paragraphCount).toBe(3);
    expect(preferences.fontId).toBe('escolar');
    expect(preferences.companions).toHaveLength(1);
    expect(preferences.customEnvironment).toBe('');
    expect(preferences.customValue).toBe('');
  });
});
