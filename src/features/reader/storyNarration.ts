export interface NarrationSegment {
  pageIndex: number;
  text: string;
}

export function createNarrationSequence(
  title: string,
  paragraphs: string[],
  moral: string,
): NarrationSegment[] {
  return paragraphs.map((paragraph, pageIndex) => {
    const titlePrefix = pageIndex === 0 ? `${title}. ` : '';
    const moralSuffix = pageIndex === paragraphs.length - 1 ? ` Enseñanza: ${moral}` : '';

    return {
      pageIndex,
      text: `${titlePrefix}${paragraph}${moralSuffix}`,
    };
  });
}
