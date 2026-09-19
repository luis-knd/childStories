import {
  companions,
  environments,
  magicItems,
  moralValues,
  protagonists,
  tones,
} from './catalog';
import type { StoryPreferences } from './types';

function pick<T>(items: readonly T[], seed: number, offset: number): T {
  return items[Math.abs(seed + offset) % items.length]!;
}

export function createSurprisePreferences(seed = Date.now()): StoryPreferences {
  const protagonist = pick(protagonists, seed, 1);
  return {
    protagonist: protagonist.name,
    age: protagonist.age,
    companions: [{ id: pick(companions, seed, 3).id }],
    environmentId: pick(environments, seed, 5).id,
    customEnvironment: '',
    magicItem: pick(magicItems, seed, 7),
    valueId: pick(moralValues, seed, 11).id,
    customValue: '',
    toneId: pick(tones, seed, 13).id,
    paragraphCount: 3,
    paragraphLength: 'medium',
    fontId: 'escolar',
  };
}
