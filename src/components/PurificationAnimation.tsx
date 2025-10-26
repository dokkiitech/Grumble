import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface PurificationAnimationProps {
  onComplete?: () => void;
}

export const PurificationAnimation: React.FC<PurificationAnimationProps> = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 成仏アニメーション: フェードイン + スケール + 回転 + 上昇
    Animated.sequence([
      // フェードインとスケールアップ
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 少し待つ
      Animated.delay(400),
      // 上昇しながらフェードアウト
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: -200,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // アニメーション完了時のコールバック
      onComplete?.();
    });
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animationContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
              { rotate },
            ],
          },
        ]}
      >
        {/* 成仏エフェクト */}
        <View style={styles.iconContainer}>
          <IconSymbol name="sparkles" size={80} color="#FFD700" />
        </View>

        {/* パーティクル効果 (簡易版) */}
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
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 100,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  particle1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    top: -20,
    left: -20,
  },
  particle2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFA500',
    top: -30,
    right: -10,
  },
  particle3: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35',
    bottom: -25,
    left: 10,
  },
});
