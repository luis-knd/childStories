export interface StoryPage {
  number: number;
  paragraph: string;
}

export function createStoryPages(paragraphs: string[]): StoryPage[] {
  return paragraphs.map((paragraph, index) => ({
    number: index + 1,
    paragraph,
  }));
}

export function moveStoryPage(current: number, delta: number, pageCount: number): number {
  return Math.max(0, Math.min(current + delta, Math.max(0, pageCount - 1)));
}
