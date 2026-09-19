import { describe, expect, it, vi } from 'vitest';

import worker, { type WorkerEnvironment } from '../index';

function createEnvironment(): WorkerEnvironment {
  const values = new Map<string, string>();
  return {
    FAMILY_ACCESS_TOKEN: 'family-token',
    AI: {
      run: vi.fn(async () => ({
        response: JSON.stringify({
          title: 'Valentina y la senda luminosa',
          subtitle: 'Una aventura en familia',
          paragraphs: ['Una tarde comenzó el viaje.', 'Juntos resolvieron el misterio.', 'Todos regresaron felices.'],
          questions: ['¿Qué encontraron?', '¿Cómo colaboraron?', '¿Qué aprendieron?'],
          moral: 'La amistad ilumina el camino.',
          readingLevel: 'aventura-infantil',
          illustrationPrompt: 'A child and two caring adults in a magical garden, storybook art',
          illustrationQuery: 'magical garden storybook',
        }),
      })),
    },
    RATE_LIMITS: {
      get: async (key: string) => values.get(key) ?? null,
      put: async (key: string, value: string) => { values.set(key, value); },
    },
  };
}

describe('family story worker', () => {
  it('rejects requests without the family access token', async () => {
    const environment = createEnvironment();
    const request = new Request('https://stories.example.workers.dev/stories', {
      method: 'POST',
      headers: { 'X-Installation-Id': 'device-one' },
      body: JSON.stringify({ preferences: {} }),
    });

    const response = await worker.fetch(request, environment);

    expect(response.status).toBe(401);
    expect(environment.AI.run).not.toHaveBeenCalled();
  });

  it('generates a structured story with the text model', async () => {
    const environment = createEnvironment();
    const request = new Request('https://stories.example.workers.dev/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Family-Token': 'family-token',
        'X-Installation-Id': 'device-one',
      },
      body: JSON.stringify({
        preferences: {
          protagonist: 'Valentina',
          age: 7,
          companions: [{ id: 'custom', name: 'mi mamá Carolina' }],
          environmentId: 'jardin',
          magicItem: 'un patín dorado',
          valueId: 'amistad',
          toneId: 'calm',
          paragraphCount: 3,
          paragraphLength: 'medium',
          fontId: 'escolar',
        },
      }),
    });

    const response = await worker.fetch(request, environment);
    const story = await response.json() as { title: string };

    expect(response.status).toBe(200);
    expect(story.title).toBe('Valentina y la senda luminosa');
    expect(environment.AI.run).toHaveBeenCalledWith(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      expect.objectContaining({ max_tokens: 1_100 }),
    );
  });

  it('accepts the object response returned by Cloudflare JSON Mode', async () => {
    const environment = createEnvironment();
    const stringResponse = await environment.AI.run('unused', {}) as { response: string };
    environment.AI.run = vi.fn(async () => ({ response: JSON.parse(stringResponse.response) }));
    const request = new Request('https://stories.example.workers.dev/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Family-Token': 'family-token',
        'X-Installation-Id': 'device-json-mode',
      },
      body: JSON.stringify({
        preferences: {
          protagonist: 'Luna',
          age: 7,
          companions: [{ id: 'sapo-andres' }],
          environmentId: 'jardin',
          magicItem: 'una llave de estrellas',
          valueId: 'amistad',
          toneId: 'calm',
          paragraphCount: 3,
          paragraphLength: 'medium',
          fontId: 'escolar',
        },
      }),
    });

    const response = await worker.fetch(request, environment);

    expect(response.status).toBe(200);
  });

  it('generates one low-cost illustration with FLUX', async () => {
    const environment = createEnvironment();
    environment.AI.run = vi.fn(async () => ({ image: 'encoded-image' }));
    const request = new Request('https://stories.example.workers.dev/illustrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Family-Token': 'family-token',
        'X-Installation-Id': 'device-two',
      },
      body: JSON.stringify({
        prompt: 'A gentle storybook scene in a magical garden, no text',
        seed: 42,
      }),
    });

    const response = await worker.fetch(request, environment);
    const illustration = await response.json() as { image: string; mimeType: string };

    expect(response.status).toBe(200);
    expect(illustration).toEqual({ image: 'encoded-image', mimeType: 'image/jpeg' });
    expect(environment.AI.run).toHaveBeenCalledWith(
      '@cf/black-forest-labs/flux-1-schnell',
      { prompt: 'A gentle storybook scene in a magical garden, no text', steps: 4 },
    );
  });

  it('rejects an incomplete model response instead of charging for a second attempt', async () => {
    const environment = createEnvironment();
    environment.AI.run = vi.fn(async () => ({ response: '{}' }));
    const request = new Request('https://stories.example.workers.dev/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Family-Token': 'family-token',
        'X-Installation-Id': 'device-three',
      },
      body: JSON.stringify({
        preferences: {
          protagonist: 'Valentina',
          age: 7,
          companions: [{ id: 'sapo-andres' }],
          environmentId: 'jardin',
          magicItem: 'una flor dorada',
          valueId: 'amistad',
          toneId: 'calm',
          paragraphCount: 3,
          paragraphLength: 'medium',
          fontId: 'escolar',
        },
      }),
    });

    const response = await worker.fetch(request, environment);

    expect(response.status).toBe(502);
    expect(environment.AI.run).toHaveBeenCalledTimes(1);
  });

  it('removes personal names from the illustration prompt', async () => {
    const environment = createEnvironment();
    environment.AI.run = vi.fn(async () => ({
      response: JSON.stringify({
        title: 'Valentina y Carolina en el jardín',
        subtitle: 'Una aventura en familia',
        paragraphs: ['Valentina salió.', 'Carolina ayudó.', 'Regresaron juntas.'],
        questions: ['¿Qué encontraron?', '¿Cómo colaboraron?', '¿Qué aprendieron?'],
        moral: 'La amistad ilumina el camino.',
        readingLevel: 'aventura-infantil',
        illustrationPrompt: 'Valentina and mi mamá Carolina in a magical garden',
        illustrationQuery: 'magical garden storybook',
      }),
    }));
    const request = new Request('https://stories.example.workers.dev/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Family-Token': 'family-token',
        'X-Installation-Id': 'device-four',
      },
      body: JSON.stringify({
        preferences: {
          protagonist: 'Valentina',
          age: 7,
          companions: [{ id: 'custom', name: 'mi mamá Carolina' }],
          environmentId: 'jardin',
          magicItem: 'una flor dorada',
          valueId: 'amistad',
          toneId: 'calm',
          paragraphCount: 3,
          paragraphLength: 'medium',
          fontId: 'escolar',
        },
      }),
    });

    const response = await worker.fetch(request, environment);
    const story = await response.json() as { illustrationPrompt: string };

    expect(story.illustrationPrompt).not.toContain('Valentina');
    expect(story.illustrationPrompt).not.toContain('Carolina');
  });

  it('returns a controlled error without retrying when the text provider fails', async () => {
    const environment = createEnvironment();
    environment.AI.run = vi.fn(async () => { throw new Error('provider unavailable'); });
    const request = new Request('https://stories.example.workers.dev/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Family-Token': 'family-token',
        'X-Installation-Id': 'device-five',
      },
      body: JSON.stringify({
        preferences: {
          protagonist: 'Valentina',
          age: 7,
          companions: [{ id: 'sapo-andres' }],
          environmentId: 'jardin',
          magicItem: 'una flor dorada',
          valueId: 'amistad',
          toneId: 'calm',
          paragraphCount: 3,
          paragraphLength: 'medium',
          fontId: 'escolar',
        },
      }),
    });

    const response = await worker.fetch(request, environment);

    expect(response.status).toBe(502);
    expect(environment.AI.run).toHaveBeenCalledTimes(1);
  });
});
