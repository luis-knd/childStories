import { describe, expect, it } from 'vitest';

import { generateStory } from '../generateStory';
import type { StoryPreferences } from '../types';

const preferences: StoryPreferences = {
  protagonist: 'Valentina',
  age: 7,
  companionId: 'sapo-andres',
  environmentId: 'jardin',
  magicItem: 'una margarita dorada',
  valueId: 'amistad',
  toneId: 'calm',
  paragraphCount: 3,
  paragraphLength: 'medium',
  fontId: 'escolar',
};

describe('generateStory', () => {
  it('creates the requested number of personalized paragraphs and three questions', () => {
    const story = generateStory(preferences, 12);

    expect(story.paragraphs).toHaveLength(3);
    expect(story.questions).toHaveLength(3);
    expect(story.title).toContain('Valentina');
    expect(story.paragraphs.join(' ')).toContain('Sapo Andrés');
    expect(story.paragraphs.join(' ')).toContain('margarita dorada');
  });

  it('uses simpler language for children aged five or younger', () => {
    const story = generateStory({ ...preferences, age: 4 }, 3);

    expect(story.readingLevel).toBe('primeros-lectores');
    expect(story.subtitle).toContain('4 años');
  });

  it('returns a different variation for a different seed', () => {
    const first = generateStory(preferences, 1);
    const second = generateStory(preferences, 2);

    expect(first.paragraphs).not.toEqual(second.paragraphs);
  });

  it('uses custom companion, place and value throughout the story', () => {
    const story = generateStory({
      ...preferences,
      companionId: 'custom',
      customCompanion: 'la abuela Luna',
      environmentId: 'custom',
      customEnvironment: 'el faro de los sueños',
      valueId: 'custom',
      customValue: 'confiar en uno mismo',
    }, 12);

    expect(story.title).toContain('el faro de los sueños');
    expect(story.subtitle).toContain('la abuela Luna');
    expect(story.paragraphs.join(' ')).toContain('la abuela Luna');
    expect(story.paragraphs.join(' ')).toContain('confiar en uno mismo');
    expect(story.moral).toContain('confiar en uno mismo');
  });

  it('builds a useful illustration prompt without personal names', () => {
    const story = generateStory({
      ...preferences,
      companions: [{ id: 'custom', name: 'mi mamá Carolina' }],
      magicItem: 'una brújula de cristal',
    }, 12);

    expect(story.illustrationPrompt).not.toContain('Valentina');
    expect(story.illustrationPrompt).not.toContain('Carolina');
    expect(story.illustrationPrompt).toContain('child');
    expect(story.illustrationPrompt).toContain('flower garden illustration');
    expect(story.illustrationQuery).toBe('flower garden illustration');
    expect(story.illustrationQuery).not.toContain('Valentina');
  });

  it('gives several companions and the secret object a coherent role', () => {
    const story = generateStory({
      ...preferences,
      companions: [
        { id: 'custom', name: 'mi mamá Carolina' },
        { id: 'custom', name: 'mi papá Luis' },
      ],
      magicItem: 'un patín dorado',
    }, 21);
    const fullStory = story.paragraphs.join(' ');

    expect(fullStory).toContain('mi mamá Carolina');
    expect(fullStory).toContain('mi papá Luis');
    expect(fullStory).toContain('el objeto secreto');
    expect(fullStory).not.toContain('recordó un patín dorado');
    expect(fullStory).not.toContain('un acompañante muy especial');
  });

  it('expands a long local story as one progressive conflict instead of repeating it', () => {
    const story = generateStory({
      ...preferences,
      paragraphCount: 5,
      paragraphLength: 'long',
    }, 21);
    const fullStory = story.paragraphs.join(' ');

    expect(story.paragraphs).toHaveLength(5);
    expect(fullStory.match(/Pronto descubrieron/g)).toHaveLength(1);
    expect(fullStory).toContain('Antes de actuar');
    expect(fullStory).toContain('Cuando llegó el momento');
  });
});
