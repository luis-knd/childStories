import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing } from 'react-native';
import { MaterialIcon } from './MaterialIcon';

export function AnimatedWand({ active }: { active: boolean }) {
  const motion = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    }).catch(() => undefined);
    const accessibility = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const appState = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => { mounted = false; accessibility.remove(); appState.remove(); };
  }, []);

  useEffect(() => {
    motion.setValue(0);
    if (!active || reduceMotion || !foreground) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(motion, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.delay(2400),
    ]));
    animation.start();
    return () => { animation.stop(); motion.setValue(0); };
  }, [active, reduceMotion, foreground, motion]);

  return (
    <Animated.View style={{ transform: [
      { rotate: motion.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-12deg'] }) },
      { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
    ] }}>
      <MaterialIcon name="wand_stars" size={34} color="#FFE8C8" />
    </Animated.View>
  );
}
