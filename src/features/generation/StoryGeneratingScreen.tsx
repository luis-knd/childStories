import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii } from '../../ui/theme';

interface StoryGeneratingScreenProps {
  protagonist: string;
  error?: string;
  onRetry: () => void;
  onBack: () => void;
}

const phases = ['Tejiendo la historia', 'Preparando las preguntas', 'Encuadernando el cuento'];

export function StoryGeneratingScreen({ protagonist, error, onRetry, onBack }: StoryGeneratingScreenProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (error) return undefined;
    if (reduceMotion) {
      progress.stopAnimation();
      return undefined;
    }
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1_700,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [error, progress, reduceMotion]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-120, 280] });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={require('../../../assets/brand-logo.png')}
            style={styles.brandLogo}
          />
        </View>
        <View style={styles.brandCopy}>
          <Text style={styles.brand}>El Jardín Secreto</Text>
          <Text style={styles.brandSubtitle}>Cuentos hechos en familia</Text>
        </View>
        <View style={styles.headerBadge}><Text style={styles.headerBadgeText}>✦ Creando</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.magicStage}>
          <Text style={[styles.sparkle, styles.sparkleLeft]}>✦</Text>
          <Text style={[styles.sparkle, styles.sparkleRight]}>✧</Text>

          <View accessible={false} style={styles.bookScene}>
            <View style={styles.bookShadow} />
            <View style={styles.openBook}>
              <View style={[styles.bookPage, styles.leftPage]}>
                <View style={styles.pageLine} /><View style={styles.pageLine} /><View style={styles.pageLineShort} />
              </View>
              <View style={[styles.bookPage, styles.rightPage]}>
                <View style={styles.pageLineGold} /><View style={styles.pageLineGold} /><View style={styles.pageLineGoldShort} />
              </View>
              <View style={styles.bookSpine} />
              <View style={styles.bookmark} />
            </View>
            <Text style={styles.wand}>✦</Text>
          </View>

          <View accessibilityLiveRegion="polite" style={styles.message}>
            <Text accessibilityRole="header" style={styles.title}>
              {error ? 'El cuento necesita otro intento' : 'Escribiendo tu aventura mágica…'}
            </Text>
            <Text style={styles.description}>
              {error ?? `Las ideas de ${protagonist} están tomando forma entre páginas y palabras.`}
            </Text>
          </View>

          {error ? (
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
                <Text style={styles.retryLabel}>Volver a intentar</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
                <Text style={styles.backLabel}>Volver</Text>
              </Pressable>
            </View>
          ) : (
            <View
              accessibilityLabel="Preparando la historia, las preguntas y la lectura"
              accessibilityLiveRegion="polite"
              accessibilityState={{ busy: true }}
              style={styles.progressArea}
            >
              <View style={styles.progressHeading}>
                <Text style={styles.progressLabel}>✦ Creando magia</Text>
                <Text style={styles.progressState}>En proceso</Text>
              </View>
              <View style={styles.progressTrack}>
                {reduceMotion ? (
                  <View style={styles.progressRibbonReduced} />
                ) : (
                  <Animated.View style={[styles.progressRibbon, { transform: [{ translateX }] }]} />
                )}
              </View>

              <View style={styles.phaseList}>
                {phases.map((label) => (
                    <View key={label} style={styles.phaseRow}>
                      <View style={styles.phaseActive}>
                        <Text style={[styles.phaseIconText, styles.phaseIconTextActive]}>
                          ✦
                        </Text>
                      </View>
                      <Text style={styles.phaseLabel}>{label}</Text>
                    </View>
                ))}
              </View>
            </View>
          )}

          {!error ? (
            <View style={styles.tip}>
              <View style={styles.tipIcon}><Text style={styles.tipIconText}>☼</Text></View>
              <View style={styles.tipCopy}>
                <Text style={styles.tipLabel}>MIENTRAS ESPERAS</Text>
                <Text style={styles.tipText}>¿Qué voz pondrás al personaje más divertido?</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 76, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  brandMark: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  brandLogo: { width: 48, height: 48 },
  brandCopy: { flex: 1, minWidth: 0 },
  brand: { fontFamily: 'Quicksand', fontSize: 17, fontWeight: '800', color: colors.primaryDark },
  brandSubtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  headerBadge: { minHeight: 44, borderRadius: radii.pill, backgroundColor: colors.goldSoft, justifyContent: 'center', paddingHorizontal: 13 },
  headerBadgeText: { color: colors.gold, fontSize: 13, fontWeight: '800' },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 28, width: '100%', maxWidth: 560, alignSelf: 'center' },
  magicStage: { flexGrow: 1, minHeight: 640, borderRadius: radii.large, backgroundColor: colors.surfaceWarm, padding: 22, alignItems: 'center', justifyContent: 'center', gap: 24, overflow: 'hidden' },
  sparkle: { position: 'absolute', color: colors.gold, fontSize: 24 },
  sparkleLeft: { top: 54, left: 32 },
  sparkleRight: { top: 160, right: 30, color: colors.primary },
  bookScene: { width: 230, height: 170, alignItems: 'center', justifyContent: 'center' },
  bookShadow: { position: 'absolute', bottom: 18, width: 156, height: 24, borderRadius: 999, backgroundColor: colors.shadow, opacity: 0.15, transform: [{ scaleX: 1.2 }] },
  openBook: { width: 190, height: 112, flexDirection: 'row', transform: [{ perspective: 700 }, { rotateX: '4deg' }] },
  bookPage: { flex: 1, backgroundColor: colors.surface, borderTopWidth: 5, borderBottomWidth: 9, borderColor: colors.gold, paddingTop: 28, gap: 10 },
  leftPage: { borderLeftWidth: 9, borderTopLeftRadius: 9, borderBottomLeftRadius: 14, paddingLeft: 22, paddingRight: 12 },
  rightPage: { borderRightWidth: 9, borderTopRightRadius: 9, borderBottomRightRadius: 14, paddingLeft: 12, paddingRight: 22 },
  bookSpine: { position: 'absolute', left: 93, top: 4, bottom: 7, width: 4, backgroundColor: colors.gold },
  bookmark: { position: 'absolute', left: 89, bottom: -15, width: 12, height: 30, backgroundColor: '#D89A22', transform: [{ rotate: '8deg' }] },
  pageLine: { height: 3, borderRadius: 3, backgroundColor: colors.border },
  pageLineShort: { height: 3, width: '72%', borderRadius: 3, backgroundColor: colors.border },
  pageLineGold: { height: 3, borderRadius: 3, backgroundColor: '#E9B75A' },
  pageLineGoldShort: { height: 3, width: '72%', borderRadius: 3, backgroundColor: '#E9B75A' },
  wand: { position: 'absolute', top: 0, color: '#D89A22', fontSize: 31, transform: [{ rotate: '-20deg' }] },
  message: { gap: 10, maxWidth: 420 },
  title: { color: colors.primaryDark, fontFamily: 'Quicksand', fontSize: 29, lineHeight: 37, textAlign: 'center' },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  progressArea: { width: '100%', maxWidth: 420, gap: 11 },
  progressHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  progressLabel: { color: colors.gold, fontSize: 15, fontWeight: '800' },
  progressState: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  progressTrack: { height: 12, borderRadius: 999, backgroundColor: colors.border, overflow: 'hidden' },
  progressRibbon: { height: '100%', width: 120, borderRadius: 999, backgroundColor: colors.primary },
  progressRibbonReduced: { height: '100%', width: '58%', alignSelf: 'center', borderRadius: 999, backgroundColor: colors.primary },
  phaseList: { backgroundColor: colors.surface, borderRadius: radii.medium, padding: 16, gap: 15, marginTop: 4 },
  phaseRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 12 },
  phaseActive: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  phaseIconText: { color: colors.muted, fontSize: 15, fontWeight: '900' },
  phaseIconTextActive: { color: colors.primaryDark },
  phaseLabel: { flex: 1, color: colors.ink, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  tip: { width: '100%', maxWidth: 420, borderRadius: radii.medium, backgroundColor: colors.goldSoft, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#D89A22', alignItems: 'center', justifyContent: 'center' },
  tipIconText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  tipCopy: { flex: 1, gap: 3 },
  tipLabel: { color: colors.gold, fontSize: 11, letterSpacing: 0.8, fontWeight: '900' },
  tipText: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  actions: { gap: 12, width: '100%', maxWidth: 420 },
  retry: { backgroundColor: colors.primary, borderRadius: radii.medium, minHeight: 48, padding: 14, alignItems: 'center', justifyContent: 'center' },
  retryLabel: { color: colors.white, fontSize: 16, fontWeight: '700' },
  back: { minHeight: 48, padding: 14, alignItems: 'center', justifyContent: 'center' },
  backLabel: { color: colors.primaryDark, fontSize: 16, fontWeight: '700' },
});
