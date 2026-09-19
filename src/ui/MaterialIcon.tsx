import { Text } from 'react-native';
import { colors } from './theme';

const glyphs = {
  menu_book: '\uea19', shield: '\ue9e0', hourglass_empty: '\ue88b', edit_note: '\ue745',
  face: '\ue87c', pets: '\ue91d', explore: '\ue87a', auto_awesome: '\ue65f',
  favorite: '\ue87d', nights_stay: '\uea46', format_size: '\ue245',
  casino: '\ueb40', check: '\ue5ca', close: '\ue5cd', wand_stars: '\uf31e',
} as const;

export type MaterialIconName = keyof typeof glyphs;

export function MaterialIcon({ name, size = 28, color = colors.primary }: {
  name: MaterialIconName;
  size?: number;
  color?: string;
}) {
  return <Text accessible={false} importantForAccessibility="no" style={{ fontFamily: 'MaterialSymbols', fontSize: size, lineHeight: size, color, fontWeight: 'normal' }}>{glyphs[name]}</Text>;
}
