import { IconSymbol } from '@/components/ui/icon-symbol';
import { BONFIRE_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from '@/src/constants/otakinage';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface BonfireSectionProps {
  bonfireIntensity: Animated.Value;
  onBurnAll: () => void;
  hasGrumbles: boolean;
}

export const BonfireSection: React.FC<BonfireSectionProps> = ({
  bonfireIntensity,
  onBurnAll,
  hasGrumbles,
}) => {
  const bonfireScale = bonfireIntensity.interpolate({
    inputRange: [0, 0.5, 1, 1.5],
    outputRange: [1, 1.2, 1.5, 2],
  });

  const bonfireOpacity = bonfireIntensity.interpolate({
    inputRange: [0, 0.5, 1, 1.5],
    outputRange: [0.6, 0.8, 1, 1],
  });

  return (
    <View style={styles.topSection}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFill}
      >
        {/* 星 */}
        <View style={styles.star1} />
        <View style={styles.star2} />
        <View style={styles.star3} />
        <View style={styles.star4} />

        {/* テキスト */}
        <Text style={styles.topText}>投稿を火にくべて成仏させよう!</Text>

        {/* 火のエフェクト */}
        <View style={styles.bonfireContainer}>
          <Animated.View
            style={[
              styles.bonfire,
              {
                transform: [{ scale: bonfireScale }],
                opacity: bonfireOpacity,
              },
            ]}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E', '#FFC107', '#FFD700']}
              style={styles.bonfireGradient}
            >
              <IconSymbol name="flame.fill" size={120} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </View>
      </LinearGradient>

      {/* 「すべて火にくべる」ボタン */}
      {hasGrumbles && (
        <View style={styles.burnAllButtonContainer}>
          <Pressable
            onPress={onBurnAll}
            style={({ pressed }) => [
              styles.burnAllButton,
              pressed && styles.burnAllButtonPressed,
            ]}
          >
            <Text style={styles.burnAllButtonText}>+全て火にくべる</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topSection: {
    height: SCREEN_HEIGHT * 0.5,
    position: 'relative',
  },
  star1: {
    position: 'absolute',
    top: 60,
    left: 50,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  star2: {
    position: 'absolute',
    top: 100,
    right: 80,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#fff',
  },
  star3: {
    position: 'absolute',
    top: 40,
    right: 120,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },
  star4: {
    position: 'absolute',
    top: 80,
    left: 120,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#fff',
  },
  topText: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bonfireContainer: {
    position: 'absolute',
    top: BONFIRE_Y - 60,
    left: SCREEN_WIDTH / 2 - 60,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonfire: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 20,
  },
  bonfireGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burnAllButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    marginBottom: 16,
  },
  burnAllButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  burnAllButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
    backgroundColor: '#f5f5f5',
  },
  burnAllButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

