import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii } from './theme';

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  leading?: ReactNode;
  disabled?: boolean;
}

export function ChoiceChip({ label, selected, onPress, leading, disabled = false }: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selectedChip,
        disabled && styles.disabledChip,
        pressed && styles.pressed,
      ]}
    >
      {leading}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{selected ? `✓ ${label}` : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  disabledChip: { opacity: 0.5 },
  selectedChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedLabel: {
    color: colors.primaryDark,
  },
  pressed: {
    opacity: 0.72,
  },
});
