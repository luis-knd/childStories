import { describe, expect, it, vi } from 'vitest';

import { generateStoryWithFallback } from '../StoryGenerationService';
import type { StoryPreferences } from '../../../domain/story/types';

const preferences: StoryPreferences = {
  protagonist: 'Caroline',
  age: 7,
  companions: [
    { id: 'custom', name: 'mi mamá Carolina' },
    { id: 'custom', name: 'mi papá Luis' },
  ],
  environmentId: 'jardin',
  magicItem: 'un patín dorado',
  valueId: 'amistad',
  toneId: 'calm',
  paragraphCount: 3,
  paragraphLength: 'medium',
  fontId: 'escolar',
};

describe('generateStoryWithFallback', () => {
  it('returns a validated dynamic story from the family worker', async () => {
    let requestInit: RequestInit | undefined;
    const fetcher = vi.fn(async (_input: unknown, init?: RequestInit) => {
      requestInit = init;
      return ({
      ok: true,
      json: async () => ({
        title: 'Caroline y el sendero dorado',
        subtitle: 'Una aventura en familia',
        paragraphs: ['Primero ocurrió algo.', 'Después afrontaron el reto.', 'Al final regresaron.'],
        questions: ['¿Qué descubrieron?', '¿Cómo se ayudaron?', '¿Qué aprendiste?'],
        moral: 'Ayudarnos hace más luminoso el camino.',
        readingLevel: 'aventura-infantil',
        illustrationPrompt: 'A warm storybook family scene in a magical garden',
        illustrationQuery: 'magical garden storybook',
      }),
      }) as Response;
    }) as unknown as typeof fetch;

    const story = await generateStoryWithFallback(preferences, {
      apiUrl: 'https://family-stories.example.workers.dev',
      accessToken: 'family-token',
      installationId: 'device-one',
      fetcher,
    });

    expect(story.source).toBe('dynamic');
    expect(story.paragraphs).toHaveLength(3);
    expect(story.preferences).toEqual(preferences);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(requestInit?.signal).toBeInstanceOf(AbortSignal);
  });

  it('uses the predefined story after one failed remote attempt', async () => {
    const fetcher = vi.fn(async () => ({ ok: false }) as Response) as unknown as typeof fetch;

    const story = await generateStoryWithFallback(preferences, {
      apiUrl: 'https://family-stories.example.workers.dev',
      accessToken: 'family-token',
      installationId: 'device-two',
      fetcher,
    });

    expect(story.source).toBe('predefined');
    expect(story.paragraphs.join(' ')).toContain('un patín dorado');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('rejects a remote story with a different paragraph count', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        title: 'Un cuento incompleto',
        subtitle: 'Falta una parte',
        paragraphs: ['Comenzaron el viaje.', 'Regresaron demasiado pronto.'],
        questions: ['¿Qué ocurrió?', '¿Quién ayudó?', '¿Qué aprendiste?'],
        moral: 'Hay que terminar lo que se empieza.',
        readingLevel: 'aventura-infantil',
        illustrationPrompt: 'A storybook garden',
        illustrationQuery: 'storybook garden',
      }),
    }) as Response) as unknown as typeof fetch;

    const story = await generateStoryWithFallback(preferences, {
      apiUrl: 'https://family-stories.example.workers.dev',
      accessToken: 'family-token',
      installationId: 'device-three',
      fetcher,
    });

    expect(story.source).toBe('predefined');
    expect(story.paragraphs).toHaveLength(3);
  });
});
