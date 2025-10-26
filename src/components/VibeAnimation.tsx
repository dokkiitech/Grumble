import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface VibeAnimationProps {
  onComplete?: () => void;
}

export const VibeAnimation: React.FC<VibeAnimationProps> = ({ onComplete }) => {
  // 炎の各層のアニメーション値
  const flame1Scale = useRef(new Animated.Value(0)).current;
  const flame2Scale = useRef(new Animated.Value(0)).current;
  const flame3Scale = useRef(new Animated.Value(0)).current;

  const flame1Opacity = useRef(new Animated.Value(0)).current;
  const flame2Opacity = useRef(new Animated.Value(0)).current;
  const flame3Opacity = useRef(new Animated.Value(0)).current;

  const flame1TranslateY = useRef(new Animated.Value(20)).current;
  const flame2TranslateY = useRef(new Animated.Value(20)).current;
  const flame3TranslateY = useRef(new Animated.Value(20)).current;

  // 揺らぎのアニメーション
  const flicker1 = useRef(new Animated.Value(0)).current;
  const flicker2 = useRef(new Animated.Value(0)).current;
  const flicker3 = useRef(new Animated.Value(0)).current;

  // 火花のアニメーション
  const sparks = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
    }))
  ).current;

  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 炎の3層が順番に燃え上がる
    Animated.stagger(80, [
      // 第1層（外側・赤）
      Animated.parallel([
        Animated.spring(flame1Scale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(flame1Opacity, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(flame1TranslateY, {
          toValue: 0,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      // 第2層（中間・オレンジ）
      Animated.parallel([
        Animated.spring(flame2Scale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(flame2Opacity, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(flame2TranslateY, {
          toValue: 0,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      // 第3層（内側・黄色）
      Animated.parallel([
        Animated.spring(flame3Scale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(flame3Opacity, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(flame3TranslateY, {
          toValue: 0,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 炎の揺らぎアニメーション（ループ）
    Animated.loop(
      Animated.sequence([
        Animated.timing(flicker1, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flicker1, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flicker2, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(flicker2, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flicker3, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flicker3, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 火花が飛び散るアニメーション
    const sparkAnimations = sparks.map((spark, index) => {
      const angle = (index / sparks.length) * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      const translateX = Math.cos(angle) * distance;
      const translateY = Math.sin(angle) * distance - 20; // 上方向にバイアス

      return Animated.parallel([
        Animated.timing(spark.translateX, {
          toValue: translateX,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(spark.translateY, {
          toValue: translateY,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(spark.opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(spark.scale, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(sparkAnimations).start();

    // 全体のフェードアウト
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 400,
      delay: 500,
      useNativeDriver: true,
    }).start(() => {
      if (onComplete) {
        onComplete();
      }
    });
  }, []);

  // 炎の揺らぎを計算
  const flickerInterpolate1 = flicker1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const flickerInterpolate2 = flicker2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const flickerInterpolate3 = flicker3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

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
      <Svg width="70" height="70" viewBox="0 0 70 70">
        <Defs>
          {/* 外側の炎（赤）のグラデーション */}
          <LinearGradient id="flameGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FF5722" stopOpacity="1" />
            <Stop offset="100%" stopColor="#D32F2F" stopOpacity="0.8" />
          </LinearGradient>
          {/* 中間の炎（オレンジ）のグラデーション */}
          <LinearGradient id="flameGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FF9800" stopOpacity="1" />
            <Stop offset="100%" stopColor="#F57C00" stopOpacity="0.9" />
          </LinearGradient>
          {/* 内側の炎（黄色）のグラデーション */}
          <LinearGradient id="flameGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFC107" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFA000" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* 炎の第1層（外側・赤） - 不規則な炎の形 */}
        <AnimatedG
          transform={`translate(35, 60)`}
          opacity={flame1Opacity}
          scale={flame1Scale}
          translateY={flame1TranslateY}
        >
          <AnimatedPath
            d="M0,-30 C-6,-28 -9,-24 -11,-18 C-12,-15 -10,-11 -12,-7 C-13,-4 -9,0 -7,4 C-6,6 -4,8 -2,9 C-1,10 0,11 0,11 C0,11 1,10 2,9 C4,8 6,6 7,4 C9,0 13,-4 12,-7 C10,-11 12,-15 11,-18 C9,-24 6,-28 0,-30 Z"
            fill="url(#flameGrad1)"
            scale={flickerInterpolate1}
            origin="0, 0"
          />
        </AnimatedG>

        {/* 炎の第2層（中間・オレンジ） - 中間の炎 */}
        <AnimatedG
          transform={`translate(35, 60)`}
          opacity={flame2Opacity}
          scale={flame2Scale}
          translateY={flame2TranslateY}
        >
          <AnimatedPath
            d="M0,-23 C-5,-21 -7,-18 -8,-13 C-9,-10 -7,-8 -9,-5 C-9,-2 -7,0 -5,3 C-4,5 -2,6 -1,7 C0,8 0,8 0,8 C0,8 1,8 2,7 C3,6 4,5 5,3 C7,0 9,-2 9,-5 C7,-8 9,-10 8,-13 C7,-18 5,-21 0,-23 Z"
            fill="url(#flameGrad2)"
            scale={flickerInterpolate2}
            origin="0, 0"
          />
        </AnimatedG>

        {/* 炎の第3層（内側・黄色） - 芯の部分 */}
        <AnimatedG
          transform={`translate(35, 60)`}
          opacity={flame3Opacity}
          scale={flame3Scale}
          translateY={flame3TranslateY}
        >
          <AnimatedPath
            d="M0,-15 C-3,-14 -5,-11 -5,-8 C-6,-6 -5,-5 -5,-3 C-5,-1 -4,0 -3,2 C-2,3 -1,4 0,5 C0,5 0,5 0,5 C0,5 0,5 1,4 C2,3 3,2 3,2 C4,0 5,-1 5,-3 C5,-5 6,-6 5,-8 C5,-11 3,-14 0,-15 Z"
            fill="url(#flameGrad3)"
            scale={flickerInterpolate3}
            origin="0, 0"
          />
        </AnimatedG>

        {/* 火花パーティクル */}
        {sparks.map((spark, index) => (
          <AnimatedG
            key={index}
            transform={`translate(35, 50)`}
            opacity={spark.opacity}
            translateX={spark.translateX}
            translateY={spark.translateY}
          >
            <AnimatedPath
              d="M0,0 L0.6,2 L-0.6,2 Z"
              fill="#FFD54F"
              scale={spark.scale}
              origin="0, 0"
            />
          </AnimatedG>
        ))}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end', // 下揃え
    width: 70,
    height: 70,
    bottom: 0, // ボタンの底面に合わせる
    left: '50%',
    marginLeft: -35, // 幅の半分を引いて中央配置
    zIndex: 1000,
  },
});
