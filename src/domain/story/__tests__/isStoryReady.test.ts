import { describe, expect, it } from 'vitest';

import { isStoryReady } from '../isStoryReady';
import type { StoryPreferences } from '../types';

const preferences: StoryPreferences = {
  protagonist: 'Valentina',
  age: 7,
  companions: [{ id: 'sapo-andres' }],
  environmentId: 'jardin',
  customEnvironment: '',
  magicItem: 'una flor dorada',
  valueId: 'amistad',
  customValue: '',
  toneId: 'calm',
  paragraphCount: 3,
  paragraphLength: 'medium',
  fontId: 'escolar',
};

describe('isStoryReady', () => {
  it('accepts complete catalog choices', () => {
    expect(isStoryReady(preferences)).toBe(true);
  });

  it.each([
    ['environmentId', 'customEnvironment'],
    ['valueId', 'customValue'],
  ] as const)('requires text when %s is custom', (idField, customField) => {
    expect(isStoryReady({ ...preferences, [idField]: 'custom', [customField]: '  ' })).toBe(false);
    expect(isStoryReady({ ...preferences, [idField]: 'custom', [customField]: 'algo propio' })).toBe(true);
  });

  it('requires at least one valid companion', () => {
    expect(isStoryReady({ ...preferences, companions: [] })).toBe(false);
    expect(isStoryReady({
      ...preferences,
      companions: [{ id: 'custom', name: '  ' }],
    })).toBe(false);
  });
});
