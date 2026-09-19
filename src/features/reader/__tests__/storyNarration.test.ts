import { describe, expect, it } from 'vitest';

import { createNarrationSequence } from '../storyNarration';

describe('story narration sequence', () => {
  it('associates every spoken paragraph with the page that must be visible', () => {
    expect(
      createNarrationSequence(
        'El jardín valiente',
        ['La aventura comenzó.', 'Después llegó la lluvia.', 'Al final salió el sol.'],
        'La paciencia ayuda a crecer.',
      ),
    ).toEqual([
      { pageIndex: 0, text: 'El jardín valiente. La aventura comenzó.' },
      { pageIndex: 1, text: 'Después llegó la lluvia.' },
      { pageIndex: 2, text: 'Al final salió el sol. Enseñanza: La paciencia ayuda a crecer.' },
    ]);
  });

  it('returns no narration when the story has no pages', () => {
    expect(createNarrationSequence('Sin páginas', [], 'Una enseñanza')).toEqual([]);
  });
});
