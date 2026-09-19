declare module 'tracery-grammar' {
  interface Grammar {
    flatten(rule: string): string;
  }

  interface Tracery {
    createGrammar(rules: Record<string, string[]>): Grammar;
    setRng(random: () => number): void;
  }

  const tracery: Tracery;
  export default tracery;
}
