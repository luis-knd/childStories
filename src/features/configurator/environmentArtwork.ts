import type { ImageSourcePropType } from 'react-native';

export const environmentArtwork: Record<string, { source: ImageSourcePropType; caption: string }> = {
  jardin: { source: require('../../../assets/environments/jardin.png'), caption: 'Rosas y portales antiguos' },
  bosque: { source: require('../../../assets/environments/bosque.png'), caption: 'Luciérnagas y senderos dorados' },
  isla: { source: require('../../../assets/environments/isla.png'), caption: 'Caracolas y olas cristalinas' },
  castillo: { source: require('../../../assets/environments/castillo.png'), caption: 'Torres entre nubes de melocotón' },
  atico: { source: require('../../../assets/environments/atico.png'), caption: 'Libros alados y lámparas de miel' },
  caverna: { source: require('../../../assets/environments/caverna.png'), caption: 'Amatistas que brillan y cantan' },
};
