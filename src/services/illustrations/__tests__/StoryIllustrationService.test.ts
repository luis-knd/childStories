import { describe, expect, it, vi } from 'vitest';

import { findStoryIllustration } from '../StoryIllustrationService';

describe('findStoryIllustration', () => {
  it('generates a story-specific image with the family worker', async () => {
    let requestInit: RequestInit | undefined;
    const fetchMock = vi.fn(async (_input: unknown, init?: RequestInit) => {
      requestInit = init;
      return ({
        ok: true,
        json: async () => ({ image: 'encoded-image', mimeType: 'image/jpeg' }),
      }) as Response;
    });
    const fetcher = fetchMock as unknown as typeof fetch;

    const illustration = await findStoryIllustration({
      prompt: 'Valentina and her family in a secret garden',
      fallbackQuery: 'flower garden illustration',
      seed: 17,
      apiUrl: 'https://family-stories.example.workers.dev',
      accessToken: 'family-token',
      installationId: 'device-one',
      fetcher,
    });

    expect(illustration.uri).toBe('data:image/jpeg;base64,encoded-image');
    expect(illustration.provider).toBe('cloudflare');
    expect(fetcher).toHaveBeenCalledWith(
      'https://family-stories.example.workers.dev/illustrations',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-Family-Token': 'family-token' }),
      }),
    );
    expect(JSON.parse(requestInit!.body as string)).toEqual({
      prompt: 'Valentina and her family in a secret garden',
      seed: 17,
    });
  });

  it('falls back to Openverse after one unavailable worker request', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      if (String(input).includes('workers.dev')) {
        return { ok: false, json: async () => ({}) } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          results: [{ id: 'fallback', url: 'https://images.example.com/fallback.jpg' }],
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const illustration = await findStoryIllustration({
      prompt: 'a custom story scene',
      fallbackQuery: 'storybook garden',
      seed: 2,
      apiUrl: 'https://family-stories.example.workers.dev',
      accessToken: 'family-token',
      installationId: 'device-two',
      fetcher,
    });

    expect(illustration.uri).toBe('https://images.example.com/fallback.jpg');
    expect(illustration.provider).toBe('openverse');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('uses Openverse directly when the family worker is not configured', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        results: [{ id: 'open', url: 'https://images.example.com/open.jpg' }],
      }),
    }) as Response) as unknown as typeof fetch;

    const illustration = await findStoryIllustration({
      prompt: 'unused generated prompt',
      fallbackQuery: 'specific open image query',
      seed: 4,
      installationId: 'device-three',
      fetcher,
    });

    expect(illustration.provider).toBe('openverse');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('specific+open+image+query'));
  });
});
