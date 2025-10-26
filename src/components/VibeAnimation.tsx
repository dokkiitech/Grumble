import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface VibeAnimationProps {
  onComplete?: () => void;
}

export const VibeAnimation: React.FC<VibeAnimationProps> = ({ onComplete }) => {
  // アニメーション値
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const ripple1Scale = useRef(new Animated.Value(0)).current;
  const ripple2Scale = useRef(new Animated.Value(0)).current;
  const ripple3Scale = useRef(new Animated.Value(0)).current;
  const ripple1Opacity = useRef(new Animated.Value(0.6)).current;
  const ripple2Opacity = useRef(new Animated.Value(0.6)).current;
  const ripple3Opacity = useRef(new Animated.Value(0.6)).current;

  // ハートパーティクルのアニメーション（複数）
  const particles = useRef(
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    // メインのサムアップアイコンアニメーション
    Animated.sequence([
      // ポップイン
      Animated.spring(scaleAnim, {
        toValue: 1.5,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      // 通常サイズに戻る
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // リップルエフェクト（3段階）
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(ripple1Scale, {
          toValue: 2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(ripple1Opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(ripple2Scale, {
          toValue: 2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(ripple2Opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(ripple3Scale, {
          toValue: 2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(ripple3Opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // パーティクルアニメーション（8方向）
    const particleAnimations = particles.map((particle, index) => {
      const angle = (index / particles.length) * Math.PI * 2;
      const distance = 60;
      const translateX = Math.cos(angle) * distance;
      const translateY = Math.sin(angle) * distance;

      return Animated.parallel([
        Animated.timing(particle.translateX, {
          toValue: translateX,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: translateY,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 0.2,
          duration: 800,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(particleAnimations).start(() => {
      if (onComplete) {
        onComplete();
      }
    });

    // フェードアウト
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 800,
      delay: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    >
      <Svg width="120" height="120" viewBox="0 0 120 120">
        {/* リップルエフェクト */}
        <AnimatedCircle
          cx="60"
          cy="60"
          r="20"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2"
          opacity={ripple1Opacity}
          scale={ripple1Scale}
          origin="60, 60"
        />
        <AnimatedCircle
          cx="60"
          cy="60"
          r="20"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2"
          opacity={ripple2Opacity}
          scale={ripple2Scale}
          origin="60, 60"
        />
        <AnimatedCircle
          cx="60"
          cy="60"
          r="20"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2"
          opacity={ripple3Opacity}
          scale={ripple3Scale}
          origin="60, 60"
        />

        {/* メインのサムアップアイコン */}
        <G transform="translate(60, 60)">
          <AnimatedPath
            d="M0,-15 L-5,-5 L-5,10 L5,10 L5,-5 Z M5,-8 Q10,-13 10,-18 Q10,-20 8,-20 Q6,-20 6,-18 L5,-8"
            fill="#4CAF50"
            scale={scaleAnim}
            origin="0, 0"
          />
        </G>

        {/* パーティクル（小さなハート）*/}
        {particles.map((particle, index) => (
          <G key={index}>
            <AnimatedPath
              d="M60,55 Q55,50 50,55 Q45,60 50,65 L60,75 L70,65 Q75,60 70,55 Q65,50 60,55"
              fill="#4CAF50"
              opacity={particle.opacity}
              translateX={particle.translateX}
              translateY={particle.translateY}
              scale={particle.scale}
              origin="60, 65"
            />
          </G>
        ))}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    top: -40,
    left: -40,
    zIndex: 1000,
  },
});
