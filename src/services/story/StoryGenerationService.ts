import { generateStory } from '../../domain/story/generateStory';
import type { ReadingLevel, Story, StoryPreferences } from '../../domain/story/types';

export interface StoryGenerationOptions {
  apiUrl?: string;
  accessToken?: string;
  installationId: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

interface DynamicStoryPayload {
  title: string;
  subtitle: string;
  paragraphs: string[];
  questions: string[];
  moral: string;
  readingLevel: ReadingLevel;
  illustrationPrompt: string;
  illustrationQuery: string;
}

const readingLevels: ReadingLevel[] = [
  'primeros-lectores',
  'aventura-infantil',
  'lectores-autonomos',
];

function hasStrings(value: unknown, minimum: number): value is string[] {
  return Array.isArray(value)
    && value.length >= minimum
    && value.every((item) => typeof item === 'string' && item.trim().length > 0);
}

function parseDynamicStory(value: unknown, paragraphCount: number): DynamicStoryPayload {
  if (!value || typeof value !== 'object') throw new Error('El cuento dinámico no es un objeto');
  const story = value as Partial<DynamicStoryPayload>;
  const textFields = [
    story.title,
    story.subtitle,
    story.moral,
    story.illustrationPrompt,
    story.illustrationQuery,
  ];
  if (!textFields.every((field) => typeof field === 'string' && field.trim())) {
    throw new Error('El cuento dinámico está incompleto');
  }
  if (!hasStrings(story.paragraphs, paragraphCount)
    || story.paragraphs.length !== paragraphCount
    || !hasStrings(story.questions, 3)
    || story.questions.length !== 3) {
    throw new Error('El cuento dinámico no tiene la estructura esperada');
  }
  if (!story.readingLevel || !readingLevels.includes(story.readingLevel)) {
    throw new Error('El cuento dinámico no tiene un nivel de lectura válido');
  }
  return story as DynamicStoryPayload;
}

export async function generateStoryWithFallback(
  preferences: StoryPreferences,
  options: StoryGenerationOptions,
): Promise<Story> {
  if (!options.apiUrl?.trim() || !options.accessToken?.trim()) return generateStory(preferences);
  const fetcher = options.fetcher ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 25_000);
  try {
    const response = await fetcher(`${options.apiUrl.replace(/\/$/, '')}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Family-Token': options.accessToken,
        'X-Installation-Id': options.installationId,
      },
      body: JSON.stringify({ preferences }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('No fue posible generar el cuento dinámico');
    const dynamicStory = parseDynamicStory(await response.json(), preferences.paragraphCount);
    return {
      ...dynamicStory,
      id: `${Date.now()}-${preferences.protagonist}`,
      preferences,
      source: 'dynamic',
    };
  } catch {
    return generateStory(preferences);
  } finally {
    clearTimeout(timeout);
  }
}
