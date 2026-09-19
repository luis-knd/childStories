import { describe, expect, it, vi } from 'vitest';

import {
  findOpenverseIllustration,
  mapOpenverseImage,
} from '../OpenverseIllustrationService';

describe('mapOpenverseImage', () => {
  it('keeps the image URL and attribution needed by open licenses', () => {
    const image = mapOpenverseImage({
      id: 'garden-1',
      title: 'Secret garden',
      creator: 'Ada Artist',
      license: 'cc0',
      license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
      foreign_landing_url: 'https://example.com/garden',
      url: 'https://images.example.com/garden.jpg',
      thumbnail: 'https://images.example.com/garden-small.jpg',
    });

    expect(image.uri).toBe('https://images.example.com/garden-small.jpg');
    expect(image.creator).toBe('Ada Artist');
    expect(image.license).toBe('CC0');
    expect(image.sourceUrl).toBe('https://example.com/garden');
    expect(image.provider).toBe('openverse');
  });

  it('rejects results without a usable image URL', () => {
    expect(() => mapOpenverseImage({ id: 'broken' })).toThrow(
      'La imagen de Openverse no tiene una URL utilizable',
    );
  });

  it('requests public-domain images and chooses a seeded result', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        results: [
          { id: 'one', url: 'https://images.example.com/one.jpg' },
          { id: 'two', url: 'https://images.example.com/two.jpg' },
        ],
      }),
    }) as Response) as unknown as typeof fetch;

    const image = await findOpenverseIllustration('secret garden', 1, fetcher);

    expect(image.uri).toBe('https://images.example.com/two.jpg');
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('license=cc0%2Cpdm'));
  });
});
