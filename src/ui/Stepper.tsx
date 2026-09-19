import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from './theme';

interface StepperProps {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  suffix?: string;
  onChange: (value: number) => void;
}

export function Stepper({
  label,
  value,
  minimum,
  maximum,
  suffix,
  onChange,
}: StepperProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityLabel={`Reducir ${label}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: value <= minimum }}
          disabled={value <= minimum}
          onPress={() => onChange(Math.max(minimum, value - 1))}
          style={[styles.button, value <= minimum && styles.disabled]}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}{suffix ? ` ${suffix}` : ''}</Text>
        <Pressable
          accessibilityLabel={`Aumentar ${label}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: value >= maximum }}
          disabled={value >= maximum}
          onPress={() => onChange(Math.min(maximum, value + 1))}
          style={[styles.button, value >= maximum && styles.disabled]}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    minHeight: 48,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  button: {
    width: 48,
    minHeight: 48,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.35 },
  buttonText: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: '600',
  },
  value: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
});
