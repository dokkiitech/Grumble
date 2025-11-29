import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

interface CompletionMessageProps {
  isVisible: boolean;
  onBackToTimeline: () => void;
}

export const CompletionMessage: React.FC<CompletionMessageProps> = ({
  isVisible,
  onBackToTimeline,
}) => {
  const messageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, messageOpacity]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.completionOverlay,
        {
          opacity: messageOpacity,
        },
      ]}
    >
      <View style={styles.completionMessageContainer}>
        <IconSymbol name="checkmark.circle.fill" size={80} color="#FFD700" />
        <Text style={styles.completionMessage}>すべての投稿が成仏しました</Text>
        <Pressable
          onPress={onBackToTimeline}
          style={({ pressed }) => [
            styles.backToTimelineButton,
            pressed && styles.backToTimelineButtonPressed,
          ]}
        >
          <Text style={styles.backToTimelineButtonText}>タイムラインに戻る</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  completionMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  backToTimelineButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  backToTimelineButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  backToTimelineButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

