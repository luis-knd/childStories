export interface Illustration {
  uri: string;
  provider: 'openverse' | 'cloudflare';
  title: string;
  creator: string;
  license: string;
  licenseUrl?: string;
  sourceUrl?: string;
}

interface OpenverseImage {
  id?: string;
  title?: string | null;
  creator?: string | null;
  license?: string | null;
  license_url?: string | null;
  foreign_landing_url?: string | null;
  url?: string | null;
  thumbnail?: string | null;
}

interface OpenverseResponse {
  results?: OpenverseImage[];
}

type Fetcher = typeof fetch;

export function mapOpenverseImage(image: OpenverseImage): Illustration {
  const uri = image.thumbnail ?? image.url;
  if (!uri) {
    throw new Error('La imagen de Openverse no tiene una URL utilizable');
  }

  return {
    uri,
    provider: 'openverse',
    title: image.title?.trim() || 'Ilustración sin título',
    creator: image.creator?.trim() || 'Autor desconocido',
    license: image.license?.toUpperCase() || 'Licencia abierta',
    licenseUrl: image.license_url ?? undefined,
    sourceUrl: image.foreign_landing_url ?? undefined,
  };
}

export async function findOpenverseIllustration(
  query: string,
  seed: number,
  fetcher: Fetcher = fetch,
): Promise<Illustration> {
  const params = new URLSearchParams({
    q: query,
    license: 'cc0,pdm',
    page_size: '20',
    mature: 'false',
  });
  const response = await fetcher(`https://api.openverse.org/v1/images/?${params}`);
  if (!response.ok) {
    throw new Error('No fue posible consultar las ilustraciones abiertas');
  }

  const payload = (await response.json()) as OpenverseResponse;
  const usableResults = (payload.results ?? []).filter((image) => image.url || image.thumbnail);
  if (usableResults.length === 0) {
    throw new Error('Openverse no encontró ilustraciones para este cuento');
  }

  return mapOpenverseImage(usableResults[Math.abs(seed) % usableResults.length]!);
}
