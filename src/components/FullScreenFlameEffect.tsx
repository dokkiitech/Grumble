import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/src/constants/otakinage';

interface FullScreenFlameEffectProps {
  isActive: boolean;
  onMessageReady?: () => void;
}

export const FullScreenFlameEffect: React.FC<FullScreenFlameEffectProps> = ({
  isActive,
  onMessageReady,
}) => {
  const fullScreenFlameOpacity = useRef(new Animated.Value(0)).current;
  
  // 複数の炎の層のアニメーション値
  const flameLayer1 = useRef(new Animated.Value(0)).current;
  const flameLayer2 = useRef(new Animated.Value(0)).current;
  const flameLayer3 = useRef(new Animated.Value(0)).current;
  const flameLayer4 = useRef(new Animated.Value(0)).current;
  const flameLayer5 = useRef(new Animated.Value(0)).current;
  
  // 各層の揺らぎアニメーション
  const flameFlicker1 = useRef(new Animated.Value(0)).current;
  const flameFlicker2 = useRef(new Animated.Value(0)).current;
  const flameFlicker3 = useRef(new Animated.Value(0)).current;
  const flameFlicker4 = useRef(new Animated.Value(0)).current;
  const flameFlicker5 = useRef(new Animated.Value(0)).current;
  
  // パーティクルのアニメーション
  const particleAnim1 = useRef(new Animated.Value(0)).current;
  const particleAnim2 = useRef(new Animated.Value(0)).current;
  const particleAnim3 = useRef(new Animated.Value(0)).current;
  const particleAnim4 = useRef(new Animated.Value(0)).current;
  const particleAnim5 = useRef(new Animated.Value(0)).current;
  const particleAnim6 = useRef(new Animated.Value(0)).current;
  const particleAnim7 = useRef(new Animated.Value(0)).current;
  const particleAnim8 = useRef(new Animated.Value(0)).current;
  const particleAnim9 = useRef(new Animated.Value(0)).current;
  const particleAnim10 = useRef(new Animated.Value(0)).current;
  const particleAnim11 = useRef(new Animated.Value(0)).current;
  const particleAnim12 = useRef(new Animated.Value(0)).current;
  const particleAnim13 = useRef(new Animated.Value(0)).current;
  const particleAnim14 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      // リセット
      fullScreenFlameOpacity.setValue(0);
      flameLayer1.setValue(0);
      flameLayer2.setValue(0);
      flameLayer3.setValue(0);
      flameLayer4.setValue(0);
      flameLayer5.setValue(0);
      return;
    }

    // 画面全体が燃え上がるエフェクト
    Animated.parallel([
      // 各炎の層を順番に燃え上がらせる
      Animated.stagger(100, [
        Animated.timing(flameLayer1, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flameLayer2, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flameLayer3, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flameLayer4, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flameLayer5, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fullScreenFlameOpacity, {
        toValue: 0.95,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // メッセージ表示のタイミング（アニメーション開始から1.3秒後）
    setTimeout(() => {
      onMessageReady?.();
    }, 1300);

    // 各層の揺らぎアニメーション（ループ）
    const createFlickerAnimation = (flicker: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.sequence([
              Animated.timing(flicker, {
                toValue: 1,
                duration: 100 + Math.random() * 100,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(flicker, {
                toValue: 0,
                duration: 100 + Math.random() * 100,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]),
        ])
      );
    };

    createFlickerAnimation(flameFlicker1, 0).start();
    createFlickerAnimation(flameFlicker2, 50).start();
    createFlickerAnimation(flameFlicker3, 100).start();
    createFlickerAnimation(flameFlicker4, 150).start();
    createFlickerAnimation(flameFlicker5, 200).start();

    // パーティクルのアニメーション（各パーティクルが独立して動く）
    const particleAnimations = [
      particleAnim1, particleAnim2, particleAnim3, particleAnim4, particleAnim5,
      particleAnim6, particleAnim7, particleAnim8, particleAnim9, particleAnim10,
      particleAnim11, particleAnim12, particleAnim13, particleAnim14,
    ];
    
    particleAnimations.forEach((anim) => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 800 + Math.random() * 400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 0,
            duration: 800 + Math.random() * 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [isActive, onMessageReady]);

  // 各層のスケールと位置の補間
  const flameLayer1Scale = flameLayer1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });
  const flameLayer2Scale = flameLayer2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.15],
  });
  const flameLayer3Scale = flameLayer3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.25],
  });
  const flameLayer4Scale = flameLayer4.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.18],
  });
  const flameLayer5Scale = flameLayer5.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1.22],
  });

  // 各層の揺らぎによる移動
  const flameFlicker1X = flameFlicker1.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 15],
  });
  const flameFlicker2X = flameFlicker2.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });
  const flameFlicker3X = flameFlicker3.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 18],
  });
  const flameFlicker4X = flameFlicker4.interpolate({
    inputRange: [0, 1],
    outputRange: [-22, 22],
  });
  const flameFlicker5X = flameFlicker5.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 16],
  });


  return (
    <Animated.View
      style={[
        styles.fullScreenFlameOverlay,
        {
          opacity: fullScreenFlameOpacity,
        },
      ]}
      pointerEvents="none"
    >
      {/* 炎の層1（最外側・深い赤） */}
      <Animated.View
        style={[
          styles.flameLayer,
          styles.flameLayer1,
          {
            opacity: flameLayer1,
            transform: [
              { scale: flameLayer1Scale },
              { translateX: flameFlicker1X },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(139,0,0,0.9)',
            'rgba(255,69,0,0.85)',
            'rgba(255,140,0,0.8)',
            'rgba(255,165,0,0.7)',
            'transparent',
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
        />
        {/* 小さな炎のパーティクル */}
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '10%',
              bottom: '20%',
              width: SCREEN_WIDTH * 0.3,
              height: SCREEN_HEIGHT * 0.4,
              borderTopLeftRadius: SCREEN_WIDTH * 0.25,
              borderTopRightRadius: SCREEN_WIDTH * 0.2,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.08,
              borderBottomRightRadius: SCREEN_WIDTH * 0.15,
              transform: [
                {
                  scale: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.1],
                  }),
                },
                {
                  translateX: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 10],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '60%',
              bottom: '15%',
              width: SCREEN_WIDTH * 0.35,
              height: SCREEN_HEIGHT * 0.45,
              borderTopLeftRadius: SCREEN_WIDTH * 0.18,
              borderTopRightRadius: SCREEN_WIDTH * 0.28,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.12,
              borderBottomRightRadius: SCREEN_WIDTH * 0.1,
              transform: [
                {
                  scale: particleAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1.15],
                  }),
                },
                {
                  translateX: particleAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-15, 15],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '30%',
              bottom: '25%',
              width: SCREEN_WIDTH * 0.25,
              height: SCREEN_HEIGHT * 0.35,
              borderTopLeftRadius: SCREEN_WIDTH * 0.22,
              borderTopRightRadius: SCREEN_WIDTH * 0.19,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.1,
              borderBottomRightRadius: SCREEN_WIDTH * 0.13,
              transform: [
                {
                  scale: particleAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.1],
                  }),
                },
                {
                  translateX: particleAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 12],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>

      {/* 炎の層2（外側・オレンジ） */}
      <Animated.View
        style={[
          styles.flameLayer,
          styles.flameLayer2,
          {
            opacity: flameLayer2,
            transform: [
              { scale: flameLayer2Scale },
              { translateX: flameFlicker2X },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255,87,34,0.85)',
            'rgba(255,140,0,0.8)',
            'rgba(255,193,7,0.75)',
            'rgba(255,215,0,0.65)',
            'transparent',
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.3, y: 1 }}
          end={{ x: 0.7, y: 0 }}
        />
        {/* 小さな炎のパーティクル */}
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '20%',
              bottom: '18%',
              width: SCREEN_WIDTH * 0.28,
              height: SCREEN_HEIGHT * 0.38,
              borderTopLeftRadius: SCREEN_WIDTH * 0.24,
              borderTopRightRadius: SCREEN_WIDTH * 0.21,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.09,
              borderBottomRightRadius: SCREEN_WIDTH * 0.14,
              transform: [
                {
                  scale: particleAnim4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.88, 1.12],
                  }),
                },
                {
                  translateX: particleAnim4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-13, 13],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '70%',
              bottom: '22%',
              width: SCREEN_WIDTH * 0.32,
              height: SCREEN_HEIGHT * 0.42,
              borderTopLeftRadius: SCREEN_WIDTH * 0.17,
              borderTopRightRadius: SCREEN_WIDTH * 0.29,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.11,
              borderBottomRightRadius: SCREEN_WIDTH * 0.09,
              transform: [
                {
                  scale: particleAnim5.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.87, 1.13],
                  }),
                },
                {
                  translateX: particleAnim5.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-14, 14],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '45%',
              bottom: '12%',
              width: SCREEN_WIDTH * 0.22,
              height: SCREEN_HEIGHT * 0.32,
              borderTopLeftRadius: SCREEN_WIDTH * 0.21,
              borderTopRightRadius: SCREEN_WIDTH * 0.18,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.11,
              borderBottomRightRadius: SCREEN_WIDTH * 0.12,
              transform: [
                {
                  scale: particleAnim6.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.1],
                  }),
                },
                {
                  translateX: particleAnim6.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-11, 11],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>

      {/* 炎の層3（中間・明るいオレンジ） */}
      <Animated.View
        style={[
          styles.flameLayer,
          styles.flameLayer3,
          {
            opacity: flameLayer3,
            transform: [
              { scale: flameLayer3Scale },
              { translateX: flameFlicker3X },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255,107,53,0.8)',
            'rgba(255,152,0,0.75)',
            'rgba(255,193,7,0.7)',
            'rgba(255,215,0,0.6)',
            'transparent',
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.4, y: 1 }}
          end={{ x: 0.6, y: 0 }}
        />
        {/* 小さな炎のパーティクル */}
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '15%',
              bottom: '16%',
              width: SCREEN_WIDTH * 0.26,
              height: SCREEN_HEIGHT * 0.36,
              borderTopLeftRadius: SCREEN_WIDTH * 0.23,
              borderTopRightRadius: SCREEN_WIDTH * 0.2,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.1,
              borderBottomRightRadius: SCREEN_WIDTH * 0.14,
              transform: [
                {
                  scale: particleAnim7.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.89, 1.11],
                  }),
                },
                {
                  translateX: particleAnim7.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 12],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '55%',
              bottom: '20%',
              width: SCREEN_WIDTH * 0.3,
              height: SCREEN_HEIGHT * 0.4,
              borderTopLeftRadius: SCREEN_WIDTH * 0.16,
              borderTopRightRadius: SCREEN_WIDTH * 0.27,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.13,
              borderBottomRightRadius: SCREEN_WIDTH * 0.08,
              transform: [
                {
                  scale: particleAnim8.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.86, 1.14],
                  }),
                },
                {
                  translateX: particleAnim8.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-16, 16],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '35%',
              bottom: '10%',
              width: SCREEN_WIDTH * 0.24,
              height: SCREEN_HEIGHT * 0.34,
              borderTopLeftRadius: SCREEN_WIDTH * 0.2,
              borderTopRightRadius: SCREEN_WIDTH * 0.17,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.12,
              borderBottomRightRadius: SCREEN_WIDTH * 0.11,
              transform: [
                {
                  scale: particleAnim9.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.91, 1.09],
                  }),
                },
                {
                  translateX: particleAnim9.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 10],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>

      {/* 炎の層4（内側・黄色） */}
      <Animated.View
        style={[
          styles.flameLayer,
          styles.flameLayer4,
          {
            opacity: flameLayer4,
            transform: [
              { scale: flameLayer4Scale },
              { translateX: flameFlicker4X },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255,140,0,0.75)',
            'rgba(255,193,7,0.7)',
            'rgba(255,215,0,0.65)',
            'rgba(255,255,200,0.5)',
            'transparent',
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.45, y: 1 }}
          end={{ x: 0.55, y: 0 }}
        />
        {/* 小さな炎のパーティクル */}
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '25%',
              bottom: '14%',
              width: SCREEN_WIDTH * 0.24,
              height: SCREEN_HEIGHT * 0.34,
              borderTopLeftRadius: SCREEN_WIDTH * 0.22,
              borderTopRightRadius: SCREEN_WIDTH * 0.19,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.1,
              borderBottomRightRadius: SCREEN_WIDTH * 0.13,
              transform: [
                {
                  scale: particleAnim10.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.1],
                  }),
                },
                {
                  translateX: particleAnim10.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-11, 11],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '65%',
              bottom: '18%',
              width: SCREEN_WIDTH * 0.28,
              height: SCREEN_HEIGHT * 0.38,
              borderTopLeftRadius: SCREEN_WIDTH * 0.19,
              borderTopRightRadius: SCREEN_WIDTH * 0.26,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.12,
              borderBottomRightRadius: SCREEN_WIDTH * 0.1,
              transform: [
                {
                  scale: particleAnim11.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.88, 1.12],
                  }),
                },
                {
                  translateX: particleAnim11.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-13, 13],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>

      {/* 炎の層5（最内側・白熱） */}
      <Animated.View
        style={[
          styles.flameLayer,
          styles.flameLayer5,
          {
            opacity: flameLayer5,
            transform: [
              { scale: flameLayer5Scale },
              { translateX: flameFlicker5X },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255,193,7,0.7)',
            'rgba(255,215,0,0.65)',
            'rgba(255,255,200,0.6)',
            'rgba(255,255,255,0.4)',
            'transparent',
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
        />
        {/* 小さな炎のパーティクル */}
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '40%',
              bottom: '12%',
              width: SCREEN_WIDTH * 0.22,
              height: SCREEN_HEIGHT * 0.32,
              borderTopLeftRadius: SCREEN_WIDTH * 0.21,
              borderTopRightRadius: SCREEN_WIDTH * 0.18,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.11,
              borderBottomRightRadius: SCREEN_WIDTH * 0.12,
              transform: [
                {
                  scale: particleAnim12.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1.08],
                  }),
                },
                {
                  translateX: particleAnim12.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-9, 9],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flameParticle,
            {
              left: '50%',
              bottom: '16%',
              width: SCREEN_WIDTH * 0.26,
              height: SCREEN_HEIGHT * 0.36,
              borderTopLeftRadius: SCREEN_WIDTH * 0.23,
              borderTopRightRadius: SCREEN_WIDTH * 0.2,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.1,
              borderBottomRightRadius: SCREEN_WIDTH * 0.14,
              transform: [
                {
                  scale: particleAnim13.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.89, 1.11],
                  }),
                },
                {
                  translateX: particleAnim13.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 12],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullScreenFlameOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    overflow: 'hidden',
  },
  flameLayer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  // 不規則な炎の形状を作るために、各層を異なる位置とサイズに配置
  // より不規則な形状にするため、borderRadiusを大きく変動させ、位置もずらす
  flameLayer1: {
    bottom: -SCREEN_HEIGHT * 0.15,
    left: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_HEIGHT * 1.2,
    borderTopLeftRadius: SCREEN_WIDTH * 0.8,
    borderTopRightRadius: SCREEN_WIDTH * 0.6,
    borderBottomLeftRadius: SCREEN_WIDTH * 0.3,
    borderBottomRightRadius: SCREEN_WIDTH * 0.9,
  },
  flameLayer2: {
    bottom: -SCREEN_HEIGHT * 0.1,
    left: SCREEN_WIDTH * 0.05,
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_HEIGHT * 1.15,
    borderTopLeftRadius: SCREEN_WIDTH * 0.4,
    borderTopRightRadius: SCREEN_WIDTH * 0.7,
    borderBottomLeftRadius: SCREEN_WIDTH * 0.6,
    borderBottomRightRadius: SCREEN_WIDTH * 0.5,
  },
  flameLayer3: {
    bottom: -SCREEN_HEIGHT * 0.12,
    left: -SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 1.25,
    height: SCREEN_HEIGHT * 1.18,
    borderTopLeftRadius: SCREEN_WIDTH * 0.7,
    borderTopRightRadius: SCREEN_WIDTH * 0.5,
    borderBottomLeftRadius: SCREEN_WIDTH * 0.4,
    borderBottomRightRadius: SCREEN_WIDTH * 0.8,
  },
  flameLayer4: {
    bottom: -SCREEN_HEIGHT * 0.08,
    left: -SCREEN_WIDTH * 0.05,
    width: SCREEN_WIDTH * 1.15,
    height: SCREEN_HEIGHT * 1.1,
    borderTopLeftRadius: SCREEN_WIDTH * 0.5,
    borderTopRightRadius: SCREEN_WIDTH * 0.6,
    borderBottomLeftRadius: SCREEN_WIDTH * 0.7,
    borderBottomRightRadius: SCREEN_WIDTH * 0.4,
  },
  flameLayer5: {
    bottom: -SCREEN_HEIGHT * 0.1,
    left: SCREEN_WIDTH * 0.02,
    width: SCREEN_WIDTH * 1.18,
    height: SCREEN_HEIGHT * 1.12,
    borderTopLeftRadius: SCREEN_WIDTH * 0.6,
    borderTopRightRadius: SCREEN_WIDTH * 0.45,
    borderBottomLeftRadius: SCREEN_WIDTH * 0.5,
    borderBottomRightRadius: SCREEN_WIDTH * 0.65,
  },
  flameParticle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,140,0,0.6)',
    // 不規則な形状を作るために、各パーティクルに異なるborderRadiusを設定
    // 実際の値はインラインスタイルで上書きされる
  },
});

