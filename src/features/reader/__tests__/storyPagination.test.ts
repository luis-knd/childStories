import { describe, expect, it } from 'vitest';

import { createStoryPages, moveStoryPage } from '../storyPagination';

describe('story book pagination', () => {
  it('creates one book page for each story paragraph', () => {
    expect(createStoryPages(['Primero', 'Segundo', 'Tercero'])).toEqual([
      { number: 1, paragraph: 'Primero' },
      { number: 2, paragraph: 'Segundo' },
      { number: 3, paragraph: 'Tercero' },
    ]);
  });

  it('keeps page navigation inside the story', () => {
    expect(moveStoryPage(0, -1, 3)).toBe(0);
    expect(moveStoryPage(0, 1, 3)).toBe(1);
    expect(moveStoryPage(2, 1, 3)).toBe(2);
  });
});
