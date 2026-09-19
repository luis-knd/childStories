import type {
  CatalogOption,
  Companion,
  Environment,
  FontId,
  MoralValue,
  StoryToneId,
} from './types';

export const protagonists = [
  { name: 'Valentina', age: 7 },
  { name: 'Mateo', age: 8 },
  { name: 'Sofía', age: 6 },
  { name: 'Leo', age: 9 },
  { name: 'Emma', age: 5 },
  { name: 'Lucas', age: 10 },
  { name: 'Alma', age: 12 },
  { name: 'Clara', age: 4 },
  { name: 'Diego', age: 14 },
] as const;

export const companions: Companion[] = [
  {
    id: 'sapo-andres',
    label: 'El Sapo Andrés',
    description: 'un sapito verde esmeralda de ojos vivaces',
    action: 'dio un salto pequeño y señaló el camino con una sonrisa',
  },
  {
    id: 'conejito-candelario',
    label: 'Candelario el Conejito',
    description: 'un conejito blanco de patitas suaves',
    action: 'movió sus largas orejas y descubrió unas huellas brillantes',
  },
  {
    id: 'mariposa-pipa',
    label: 'Pipa la Mariposa Guía',
    description: 'una mariposa diminuta de alas doradas',
    action: 'dibujó círculos luminosos en el aire para mostrar el camino',
  },
  {
    id: 'zorrito-lucas',
    label: 'Lucas el Zorrito',
    description: 'un zorrito rojizo de cola esponjosa',
    action: 'olfateó la brisa y encontró un sendero oculto entre las hojas',
  },
  {
    id: 'gato-miso',
    label: 'Miso el Gato Astrónomo',
    description: 'un gato pelirrojo que conocía las constelaciones',
    action: 'levantó la mirada y siguió una estrella que titilaba muy cerca',
  },
  {
    id: 'estrellita',
    label: 'Estrellita de Bolsillo',
    description: 'una chispa celeste cálida y juguetona',
    action: 'encendió una luz suave que hizo aparecer un sendero secreto',
  },
];

export const environments: Environment[] = [
  {
    id: 'jardin',
    label: 'El Jardín Secreto de Rosas y Lavanda',
    shortName: 'el Jardín Secreto',
    detail: 'los rosales, la lavanda y un arroyo que cantaba bajito',
    imageQuery: 'flower garden illustration',
  },
  {
    id: 'bosque',
    label: 'El Bosque de las Luciérnagas Doradas',
    shortName: 'el Bosque Dorado',
    detail: 'los árboles centenarios y cientos de luciérnagas',
    imageQuery: 'forest fireflies illustration',
  },
  {
    id: 'isla',
    label: 'La Isla de las Caracolas Mágicas',
    shortName: 'la Isla Mágica',
    detail: 'la arena perlada y las olas de agua cristalina',
    imageQuery: 'island storybook illustration',
  },
  {
    id: 'castillo',
    label: 'El Castillo entre Nubes de Melocotón',
    shortName: 'el Castillo de Nubes',
    detail: 'las torres suaves y un cielo color melocotón',
    imageQuery: 'castle clouds illustration',
  },
  {
    id: 'atico',
    label: 'El Ático de los Libros Alados',
    shortName: 'el Ático de los Libros',
    detail: 'los pergaminos voladores y las lámparas de miel',
    imageQuery: 'library storybook illustration',
  },
  {
    id: 'caverna',
    label: 'La Caverna de las Amatistas Luminosas',
    shortName: 'la Caverna Luminosa',
    detail: 'los cuarzos violetas que emitían notas musicales',
    imageQuery: 'crystal cave illustration',
  },
];

export const moralValues: MoralValue[] = [
  {
    id: 'amistad',
    label: 'Amistad',
    moral: 'La amistad crece cuando escuchamos, compartimos y cuidamos a quien camina a nuestro lado.',
  },
  {
    id: 'curiosidad',
    label: 'Curiosidad',
    moral: 'Cada pregunta abre una puerta nueva cuando exploramos con respeto y atención.',
  },
  {
    id: 'valentia',
    label: 'Valentía',
    moral: 'Ser valiente no es dejar de sentir miedo, sino avanzar con calma y pedir ayuda.',
  },
  {
    id: 'cuidado',
    label: 'Cuidado',
    moral: 'La naturaleza responde con belleza a quienes protegen hasta a sus habitantes más pequeños.',
  },
  {
    id: 'paciencia',
    label: 'Paciencia',
    moral: 'Las cosas más hermosas encuentran su momento cuando sabemos esperar y observar.',
  },
  {
    id: 'gratitud',
    label: 'Gratitud',
    moral: 'Dar las gracias convierte los instantes sencillos en recuerdos luminosos.',
  },
];

export const tones: Array<CatalogOption & { id: StoryToneId; emoji: string }> = [
  { id: 'calm', label: 'Dulce', emoji: '🌙' },
  { id: 'joyful', label: 'Alegre', emoji: '✨' },
  { id: 'mysterious', label: 'Misterio', emoji: '🌟' },
];

export const fonts: Array<CatalogOption & { id: FontId; family: string }> = [
  { id: 'escolar', label: 'Escolar', family: 'Escolar' },
  { id: 'dancing', label: 'Dancing Script', family: 'DancingScript' },
  { id: 'caveat', label: 'Caveat', family: 'Caveat' },
  { id: 'marck', label: 'Marck Script', family: 'MarckScript' },
  { id: 'quicksand', label: 'Quicksand', family: 'Quicksand' },
];

export const magicItems = [
  'una pequeña flor de margarita dorada con brillo de rocío',
  'un reloj de arena que guardaba purpurina azul',
  'una campanilla de cristal con sonido de risas',
  'un lazo de seda que brillaba en la penumbra',
  'una caracola perlada que susurraba melodías',
] as const;
