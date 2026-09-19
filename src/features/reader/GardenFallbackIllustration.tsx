import { StyleSheet, Text, View } from 'react-native';

import { resolveCompanions, resolveEnvironment } from '../../domain/story/resolveStoryChoices';
import type { StoryPreferences } from '../../domain/story/types';
import { colors, radii } from '../../ui/theme';

interface GardenFallbackIllustrationProps {
  preferences: StoryPreferences;
}

const companionEmojis: Record<string, string> = {
  'sapo-andres': '🐸',
  'conejito-candelario': '🐰',
  'mariposa-pipa': '🦋',
  'zorrito-lucas': '🦊',
  'gato-miso': '🐱',
  estrellita: '⭐',
  custom: '✨',
};

const environmentThemes: Record<string, { background: string; symbol: string }> = {
  jardin: { background: '#FCE7D4', symbol: '🌿' },
  bosque: { background: '#DCE9D5', symbol: '🌲' },
  isla: { background: '#DDF2F1', symbol: '🏝️' },
  castillo: { background: '#F8DFD9', symbol: '🏰' },
  atico: { background: '#F2E4CA', symbol: '📚' },
  caverna: { background: '#E9DDF2', symbol: '💎' },
  custom: { background: '#F5E2EB', symbol: '✦' },
};

export function GardenFallbackIllustration({ preferences }: GardenFallbackIllustrationProps) {
  const companions = resolveCompanions(preferences);
  const companionLabels = companions.map(({ label }) => label).join(', ');
  const environment = resolveEnvironment(preferences);
  const theme = environmentThemes[environment.id] ?? environmentThemes.custom!;

  return (
    <View
      accessibilityLabel={`Ilustración local de ${preferences.protagonist} y ${companionLabels} en ${environment.label}`}
      style={[styles.canvas, { backgroundColor: theme.background }]}
    >
      <View style={[styles.glow, styles.glowOne]} />
      <View style={[styles.glow, styles.glowTwo]} />
      <Text style={styles.stars}>✦　·　✧　　✦</Text>
      <Text style={styles.environmentSymbol}>{theme.symbol}</Text>
      <View style={styles.hillBack} />
      <View style={styles.hillFront} />
      <View style={styles.characters}>
        <Text style={styles.character}>🧒🏻</Text>
        {companions.slice(0, 3).map((companion, index) => (
          <Text key={`${companion.id}-${index}`} style={styles.character}>
            {companionEmojis[companion.id] ?? companionEmojis.custom}
          </Text>
        ))}
      </View>
      <Text numberOfLines={2} style={styles.caption}>
        {preferences.protagonist} y {companionLabels} en {environment.shortName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: 230,
    borderRadius: radii.large,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  glow: { position: 'absolute', borderRadius: 999, backgroundColor: '#FFF4B8', opacity: 0.75 },
  glowOne: { width: 150, height: 150, top: -30, right: -20 },
  glowTwo: { width: 80, height: 80, top: 38, left: 45 },
  stars: { position: 'absolute', top: 30, color: colors.gold, fontSize: 21 },
  environmentSymbol: { position: 'absolute', top: 65, fontSize: 49, opacity: 0.72 },
  hillBack: {
    position: 'absolute',
    width: 500,
    height: 180,
    borderRadius: 250,
    backgroundColor: '#9CC89D',
    bottom: -100,
    left: -150,
  },
  hillFront: {
    position: 'absolute',
    width: 520,
    height: 190,
    borderRadius: 260,
    backgroundColor: '#5E936B',
    bottom: -125,
    right: -170,
  },
  characters: { flexDirection: 'row', gap: 16, marginBottom: 45 },
  character: { fontSize: 48 },
  caption: {
    position: 'absolute',
    bottom: 8,
    maxWidth: '88%',
    color: colors.white,
    fontFamily: 'Quicksand',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
});
