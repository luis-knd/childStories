import { companions, environments, moralValues } from './catalog';
import type {
  Companion,
  Environment,
  MoralValue,
  StoryCompanionSelection,
  StoryPreferences,
} from './types';

function findById<T extends { id: string }>(items: T[], id: string): T {
  return items.find((item) => item.id === id) ?? items[0]!;
}

function customText(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
}

export function resolveCompanion(preferences: StoryPreferences): Companion {
  return resolveCompanions(preferences)[0] ?? companions[0]!;
}

function resolveCompanionSelection(selection: StoryCompanionSelection): Companion | undefined {
  const name = selection.id === 'custom' ? customText(selection.name) : undefined;
  if (selection.id === 'custom' && !name) return undefined;
  if (name) {
    return {
      id: 'custom',
      label: name,
      description: name,
      action: 'propuso explorar el camino en equipo',
    };
  }
  return companions.find((companion) => companion.id === selection.id);
}

export function resolveCompanions(preferences: StoryPreferences): Companion[] {
  const selectedCompanions = preferences.companions
    ?.slice(0, 4)
    .map(resolveCompanionSelection)
    .filter((companion): companion is Companion => Boolean(companion));
  if (selectedCompanions?.length) return selectedCompanions;

  const companionId = preferences.companionId ?? companions[0]!.id;
  const name = companionId === 'custom'
    ? customText(preferences.customCompanion)
    : undefined;
  if (!name) return [findById(companions, companionId)];

  return [{
    id: 'custom',
    label: name,
    description: name,
    action: 'propuso explorar el camino en equipo',
  }];
}

export function resolveEnvironment(preferences: StoryPreferences): Environment {
  const name = preferences.environmentId === 'custom'
    ? customText(preferences.customEnvironment)
    : undefined;
  if (!name) return findById(environments, preferences.environmentId);

  return {
    id: 'custom',
    label: name,
    shortName: name,
    detail: `los rincones sorprendentes de ${name}`,
    imageQuery: `${name} children's storybook illustration`,
  };
}

export function resolveMoralValue(preferences: StoryPreferences): MoralValue {
  const name = preferences.valueId === 'custom'
    ? customText(preferences.customValue)
    : undefined;
  if (!name) return findById(moralValues, preferences.valueId);

  return {
    id: 'custom',
    label: name,
    moral: `El cuento nos recuerda que ${name} se aprende con pequeños gestos y se fortalece cada vez que lo ponemos en práctica.`,
  };
}
