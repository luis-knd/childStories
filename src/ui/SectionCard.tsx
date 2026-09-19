import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from './theme';

interface SectionCardProps extends PropsWithChildren {
  icon: ReactNode;
  title: string;
  hint?: string;
  badge?: string;
}

export function SectionCard({ icon, title, hint, badge, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.icon}>{icon}</View>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>{title}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceWarm,
    padding: 18,
    gap: 14,
  },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  headingCopy: { flex: 1, minWidth: 130, gap: 3 },
  badge: { color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: '700' },
  icon: { width: 48, minHeight: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    flexShrink: 1,
    fontFamily: 'Quicksand',
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
  },
});
