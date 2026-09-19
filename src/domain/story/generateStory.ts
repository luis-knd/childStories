import tracery from 'tracery-grammar';

import { tones } from './catalog';
import {
  resolveCompanions,
  resolveEnvironment,
  resolveMoralValue,
} from './resolveStoryChoices';
import type {
  ParagraphLength,
  ReadingLevel,
  Story,
  StoryPreferences,
} from './types';

const openingMoments = [
  'Una tarde de luz dorada',
  'Cuando las primeras estrellas despertaban',
  'En una mañana perfumada por la lluvia',
];

const challenges = [
  'el sendero se cerró y solo respondía a una decisión bondadosa',
  'un arroyo inquieto perdió su canción y necesitaba que alguien lo escuchara',
  'la luz del lugar comenzó a apagarse porque sus habitantes habían dejado de ayudarse',
];

const objectPowers = [
  'dibujó sobre el suelo un camino de pequeñas luces',
  'dejó escapar una melodía que señalaba aquello que necesitaba ayuda',
  'proyectó un resplandor cálido cada vez que alguien actuaba con generosidad',
];

const resolutions = [
  'La magia respondió con un destello cálido y el camino volvió a llenarse de colores.',
  'Todo el lugar respiró aliviado, como si una manta de estrellas lo hubiera abrazado.',
  'Sonaron campanillas invisibles y hasta las hojas comenzaron a bailar.',
];

const toneSentences = {
  calm: 'El aire era tan sereno que se oía el murmullo de cada hoja.',
  joyful: 'Cada paso despertaba una risita nueva entre las flores.',
  mysterious: 'A lo lejos, una luz desconocida parpadeó tres veces.',
} as const;

function findById<T extends { id: string }>(items: T[], id: string): T {
  return items.find((item) => item.id === id) ?? items[0]!;
}

function seededRandom(seed: number): () => number {
  let value = Math.abs(seed) || 1;
  return () => {
    value = (value * 16_807) % 2_147_483_647;
    return (value - 1) / 2_147_483_646;
  };
}

function formatSpanishList(values: string[]): string {
  if (values.length < 2) return values[0] ?? '';
  return `${values.slice(0, -1).join(', ')} y ${values.at(-1)}`;
}

function enrichParagraph(
  text: string,
  length: ParagraphLength,
  detail: string,
  paragraphIndex: number,
): string {
  if (length === 'short') return text;
  const mediumDetails = [
    `A su alrededor se extendían ${detail}.`,
    'Se detuvieron a escuchar con atención antes de decidir qué hacer.',
    'Compartieron sus ideas hasta encontrar una posibilidad que cuidaba de todos.',
    'Cada pequeño gesto hizo que el camino pareciera un poco más claro.',
    'Al mirar atrás, entendieron cuánto había cambiado aquel lugar y también ellos.',
  ];
  const longDetails = [
    'La luz, los aromas y los sonidos convertían cada paso en un descubrimiento.',
    'Aunque sintieron dudas, ninguno quiso abandonar a los demás.',
    'El plan no era perfecto, pero todos aportaron algo para mejorarlo.',
    'Avanzaron despacio, atentos a la señal que la magia acababa de revelar.',
    'Guardaron aquel momento en la memoria para recordarlo cuando llegaran días difíciles.',
  ];
  const detailIndex = Math.min(paragraphIndex, mediumDetails.length - 1);
  const mediumText = `${text} ${mediumDetails[detailIndex]}`;
  if (length === 'medium') return mediumText;
  return `${mediumText} ${longDetails[detailIndex]}`;
}

function getReadingLevel(age: number): ReadingLevel {
  if (age <= 5) return 'primeros-lectores';
  if (age <= 9) return 'aventura-infantil';
  return 'lectores-autonomos';
}

function buildIllustrationPrompt(
  age: number,
  companionCount: number,
  environmentQuery: string,
  toneId: string,
): string {
  const companionDescription = companionCount === 1
    ? 'one caring companion'
    : `${companionCount} caring companions`;
  const mood = toneId === 'joyful' ? 'bright and joyful' : toneId === 'mysterious' ? 'gentle and mysterious' : 'calm and warm';
  return [
    `Warm children's storybook illustration of a ${age}-year-old child with ${companionDescription}.`,
    `They are exploring a ${environmentQuery}. The mood is ${mood}.`,
    'Whimsical hand-painted picture-book style, expressive but gentle, rich scenery, warm light.',
    'Landscape composition, child-safe, no text, no letters, no watermark, no frightening imagery.',
  ].join(' ');
}

export function generateStory(preferences: StoryPreferences, seed = Date.now()): Story {
  const companions = resolveCompanions(preferences);
  const companionLabels = formatSpanishList(companions.map(({ label }) => label));
  const companionReference = companions.length === 1 ? 'su acompañante' : 'sus acompañantes';
  const environment = resolveEnvironment(preferences);
  const value = resolveMoralValue(preferences);
  const tone = findById(tones, preferences.toneId);
  const paragraphCount = Math.min(5, Math.max(2, preferences.paragraphCount));

  tracery.setRng(seededRandom(seed));
  const grammar = tracery.createGrammar({
    openingMoment: openingMoments,
    challenge: challenges,
    objectPower: objectPowers,
    resolution: resolutions,
    opening: [
      `#openingMoment#, ${preferences.protagonist} llegó a ${environment.shortName}. Allí esperaba ${companionLabels}. Llevaba consigo un objeto secreto: «${preferences.magicItem}». ${toneSentences[tone.id]}`,
    ],
  });
  const challenge = grammar.flatten('#challenge#');
  const objectPower = grammar.flatten('#objectPower#');
  const resolution = grammar.flatten('#resolution#');
  const discovery = `Pronto descubrieron que ${challenge}. ${preferences.protagonist} escuchó las ideas de ${companionReference} y nadie intentó resolverlo a solas.`;
  const plan = `Antes de actuar, observaron el objeto secreto con cuidado. Comprendieron que su magia no haría el trabajo por ellos: debían usarla pensando en el bien de todos.`;
  const action = `Cuando llegó el momento, el objeto secreto ${objectPower}. ${preferences.protagonist} y ${companionReference} siguieron la señal y pusieron en práctica su plan.`;
  const ending = `${resolution} Gracias a aquella decisión, ${preferences.protagonist} y ${companionLabels} comprendieron el valor de ${value.label.toLowerCase()}. Regresaron felices, sabiendo que la verdadera magia estaba en poner esa enseñanza en práctica.`;
  const narrativeByLength: Record<number, string[]> = {
    2: [
      `${grammar.flatten('#opening#')} ${discovery}`,
      `${action} ${ending}`,
    ],
    3: [grammar.flatten('#opening#'), `${discovery} ${plan} ${action}`, ending],
    4: [grammar.flatten('#opening#'), discovery, `${plan} ${action}`, ending],
    5: [grammar.flatten('#opening#'), discovery, plan, action, ending],
  };
  const paragraphs = narrativeByLength[paragraphCount]!.map((paragraph, index) =>
    enrichParagraph(paragraph, preferences.paragraphLength, environment.detail, index));

  return {
    id: `${seed}-${preferences.protagonist}`,
    title: `${preferences.protagonist} y el secreto de ${environment.shortName}`,
    subtitle: `Lectura adaptada para ${preferences.age} años · ${companionLabels}`,
    paragraphs,
    questions: [
      `¿Qué objeto secreto llevaba ${preferences.protagonist}?`,
      `¿Cómo ayudaron ${companionReference} a resolver el problema?`,
      `¿Cuándo has demostrado tú ${value.label.toLowerCase()}?`,
    ],
    moral: value.moral,
    readingLevel: getReadingLevel(preferences.age),
    preferences: { ...preferences, paragraphCount },
    illustrationPrompt: buildIllustrationPrompt(
      preferences.age,
      companions.length,
      environment.imageQuery,
      tone.id,
    ),
    illustrationQuery: environment.imageQuery,
    source: 'predefined',
  };
}
