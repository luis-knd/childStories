import {
  findOpenverseIllustration,
  type Illustration,
} from './OpenverseIllustrationService';

interface CloudflareIllustrationResponse {
  image?: string;
  mimeType?: string;
}

interface FindStoryIllustrationOptions {
  prompt: string;
  fallbackQuery: string;
  seed: number;
  apiUrl?: string;
  accessToken?: string;
  installationId: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

async function generateCloudflareIllustration(
  options: FindStoryIllustrationOptions,
  fetcher: typeof fetch,
): Promise<Illustration> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 25_000);
  try {
    const response = await fetcher(`${options.apiUrl!.replace(/\/$/, '')}/illustrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Family-Token': options.accessToken!,
        'X-Installation-Id': options.installationId,
      },
      body: JSON.stringify({ prompt: options.prompt, seed: options.seed }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Cloudflare no pudo generar la lámina');
    const payload = (await response.json()) as CloudflareIllustrationResponse;
    if (!payload.image) throw new Error('Cloudflare no devolvió una imagen utilizable');
    const mimeType = payload.mimeType?.startsWith('image/') ? payload.mimeType : 'image/jpeg';
    return {
      uri: `data:${mimeType};base64,${payload.image}`,
      provider: 'cloudflare',
      title: 'Lámina creada para este cuento',
      creator: 'Cloudflare Workers AI',
      license: 'Generada por IA',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function findStoryIllustration(
  options: FindStoryIllustrationOptions,
): Promise<Illustration> {
  const fetcher = options.fetcher ?? fetch;
  if (options.apiUrl?.trim() && options.accessToken?.trim()) {
    try {
      return await generateCloudflareIllustration(options, fetcher);
    } catch {
      // The open-license search keeps the reader useful when the free AI quota is unavailable.
    }
  }
  return findOpenverseIllustration(options.fallbackQuery, options.seed, fetcher);
}
