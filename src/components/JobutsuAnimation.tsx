import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface JobutsuAnimationProps {
  onComplete?: () => void;
}

export const JobutsuAnimation: React.FC<JobutsuAnimationProps> = ({ onComplete }) => {
  // 赤いオーバーレイのアニメーション値
  const redOverlayOpacity = useRef(new Animated.Value(0)).current;

  // 🔥成仏テキストのアニメーション値
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.5)).current;

  // カード全体のフェードアウト
  const cardOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // アニメーションシーケンス
    Animated.sequence([
      // 1. 赤く染まっていく (1200ms)
      Animated.timing(redOverlayOpacity, {
        toValue: 0.95,
        duration: 1200,
        useNativeDriver: true,
      }),

      // 2. 🔥成仏テキストが出現 (300ms)
      Animated.parallel([
        Animated.spring(textScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      // 3. 少し待つ (500ms)
      Animated.delay(500),

      // 4. カード全体がフェードアウト (600ms)
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // アニメーション完了時にコールバック実行
      onComplete?.();
    });
  }, []);

  return (
    <Animated.View
      style={[styles.container, { opacity: cardOpacity }]}
      pointerEvents="none"
    >
      {/* 赤いオーバーレイ */}
      <Animated.View
        style={[
          styles.redOverlay,
          { opacity: redOverlayOpacity }
        ]}
      />

      {/* 🔥成仏テキスト */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ scale: textScale }]
          }
        ]}
      >
        <Text style={styles.jobutsuText}>🔥成仏</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  redOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FF5722',
    borderRadius: 12,
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  jobutsuText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5722',
    letterSpacing: 4,
  },
});
