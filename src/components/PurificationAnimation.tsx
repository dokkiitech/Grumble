import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface PurificationAnimationProps {
  onComplete?: () => void;
}

export const PurificationAnimation: React.FC<PurificationAnimationProps> = ({ onComplete }) => {
  const mainOpacity = useRef(new Animated.Value(0)).current;
  const flameOpacity = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(0.8)).current;
  const smokeOpacity = useRef(new Animated.Value(0)).current;
  const smokeScale = useRef(new Animated.Value(0.9)).current;
  const ascendTranslate = useRef(new Animated.Value(0)).current;
  const glowIntensity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 4段階: 炎 → 白煙 → 透明化 → 昇天
    Animated.sequence([
      Animated.parallel([
        Animated.timing(mainOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flameOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flameScale, {
          toValue: 1.15,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowIntensity, {
          toValue: 1,
          duration: 450,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(flameOpacity, {
          toValue: 0,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(smokeOpacity, {
          toValue: 0.9,
          duration: 420,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(smokeScale, {
          toValue: 1.35,
          duration: 420,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(mainOpacity, {
          toValue: 0.4,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(smokeOpacity, {
          toValue: 0.4,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(ascendTranslate, {
          toValue: -120,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(mainOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(smokeOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowIntensity, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete?.();
    });
  }, [ascendTranslate, flameOpacity, flameScale, glowIntensity, mainOpacity, onComplete, smokeOpacity, smokeScale]);

  const glowShadow = glowIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animationContainer,
          {
            opacity: mainOpacity,
            transform: [{ translateY: ascendTranslate }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.flameAura,
            {
              opacity: flameOpacity,
              transform: [{ scale: flameScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.smoke,
            {
              opacity: smokeOpacity,
              transform: [{ scaleY: smokeScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.iconContainer,
            {
              shadowRadius: glowShadow,
            },
          ]}
        >
          <Text style={styles.jobutsuText}>🔥 成仏</Text>
        </Animated.View>
        <View style={styles.particle1} />
        <View style={styles.particle2} />
        <View style={styles.particle3} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'stretch',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 3,
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    shadowColor: '#FFE66D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    elevation: 12,
  },
  jobutsuText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF5722',
    letterSpacing: 4,
  },
  flameAura: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: 'rgba(255,87,34,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  smoke: {
    position: 'absolute',
    width: '120%',
    height: '150%',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.35)',
    opacity: 0,
    transform: [{ scaleY: 1.2 }],
  },
  particle1: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,215,0,0.8)',
    top: 24,
    left: 32,
  },
  particle2: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,165,0,0.9)',
    top: 12,
    right: 48,
  },
  particle3: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,53,0.85)',
    bottom: 16,
    left: 54,
  },
});
