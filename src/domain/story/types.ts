export type StoryToneId = 'calm' | 'joyful' | 'mysterious';
export type ParagraphLength = 'short' | 'medium' | 'long';
export type FontId = 'escolar' | 'dancing' | 'caveat' | 'marck' | 'quicksand';
export type ReadingLevel = 'primeros-lectores' | 'aventura-infantil' | 'lectores-autonomos';

export interface StoryCompanionSelection {
  id: string;
  name?: string;
}

export interface StoryPreferences {
  protagonist: string;
  age: number;
  companions?: StoryCompanionSelection[];
  companionId?: string;
  customCompanion?: string;
  environmentId: string;
  customEnvironment?: string;
  magicItem: string;
  valueId: string;
  customValue?: string;
  toneId: StoryToneId;
  paragraphCount: number;
  paragraphLength: ParagraphLength;
  fontId: FontId;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  questions: string[];
  moral: string;
  readingLevel: ReadingLevel;
  preferences: StoryPreferences;
  illustrationPrompt: string;
  illustrationQuery: string;
  source?: 'dynamic' | 'predefined';
}

export interface CatalogOption {
  id: string;
  label: string;
}

export interface Companion extends CatalogOption {
  description: string;
  action: string;
}

export interface Environment extends CatalogOption {
  shortName: string;
  detail: string;
  imageQuery: string;
}

export interface MoralValue extends CatalogOption {
  moral: string;
}
