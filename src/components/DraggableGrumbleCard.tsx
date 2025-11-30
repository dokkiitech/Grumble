import { IconSymbol } from '@/components/ui/icon-symbol';
import { TOXIC_LEVEL_LABELS } from '@/src/constants/config';
import { BONFIRE_Y, CARD_AREA_Y } from '@/src/constants/otakinage';
import { GrumbleItem } from '@/src/services/grumble.service';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import ReanimatedAnimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface DraggableGrumbleCardProps {
  grumble: GrumbleItem;
  grumbleId: string;
  onBurn: (grumbleId: string) => void;
  isBurning: boolean;
  onDragStart?: (grumbleId: string, initialX: number, initialY: number) => void;
  onDragUpdate?: (grumbleId: string, x: number, y: number) => void;
  onDragEnd?: (grumbleId: string) => void;
  isDragging?: boolean;
}

export const DraggableGrumbleCard: React.FC<DraggableGrumbleCardProps> = ({
  grumble,
  grumbleId,
  onBurn,
  isBurning,
  onDragStart,
  onDragUpdate,
  onDragEnd,
  isDragging = false,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const startY = useSharedValue(0);
  const startX = useSharedValue(0);
  const initialAbsoluteX = useSharedValue(0);
  const initialAbsoluteY = useSharedValue(0);
  const isDraggingShared = useSharedValue(false);

  // runOnJSで安全に実行するためのラッパー関数
  const safeOnBurn = () => {
    try {
      onBurn(grumbleId);
    } catch (error) {
      console.error('Error in onBurn:', error);
    }
  };

  const safeOnDragStart = (x: number, y: number) => {
    if (onDragStart) {
      onDragStart(grumbleId, x, y);
    }
  };

  const safeOnDragUpdate = (x: number, y: number) => {
    if (onDragUpdate && isDraggingShared.value) {
      onDragUpdate(grumbleId, x, y);
    }
  };

  const safeOnDragEnd = () => {
    if (onDragEnd) {
      onDragEnd(grumbleId);
    }
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      startY.value = e.absoluteY;
      startX.value = e.absoluteX;
      initialAbsoluteX.value = e.absoluteX;
      initialAbsoluteY.value = e.absoluteY;
      scale.value = withSpring(1.1);
      opacity.value = 0; // ドラッグ開始時に即座に非表示にする
      isDraggingShared.value = true;
      runOnJS(safeOnDragStart)(e.absoluteX, e.absoluteY);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      // 初回のみrunOnJSを呼び出し、その後はスムーズに動作
      if (isDraggingShared.value) {
        const currentX = initialAbsoluteX.value + e.translationX;
        const currentY = initialAbsoluteY.value + e.translationY;
        runOnJS(safeOnDragUpdate)(currentX, currentY);
      }
    })
    .onEnd((e) => {
      isDraggingShared.value = false;
      runOnJS(safeOnDragEnd)();
      
      // 現在の絶対Y座標を計算（開始位置 + 移動距離）
      const currentAbsoluteY = startY.value + e.translationY;

      // 火の位置（BONFIRE_Y）に近づいたら燃やす
      if (currentAbsoluteY < BONFIRE_Y + 100) {
        // 火に吸い込まれるアニメーション
        translateX.value = withTiming(0, { duration: 500 });
        translateY.value = withTiming(-(CARD_AREA_Y + 200), {
          duration: 500,
        });
        scale.value = withTiming(0.3, { duration: 500 });
        opacity.value = withTiming(0, {
          duration: 500,
        }, (finished) => {
          // アニメーション完了後にコールバックを実行
          if (finished) {
            runOnJS(safeOnBurn)();
          }
        });
      } else {
        // 元の位置に戻る
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        opacity.value = withTiming(1, { duration: 200 }); // 元の位置に戻る時は表示する
      }
    })
    .activeOffsetY([-10, 10]) // 縦方向の移動が10px以上でジェスチャーを開始
    .failOffsetX([-50, 50]); // 横方向の移動が50px以上でジェスチャーをキャンセル（スクロール優先）

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const getToxicLevelColor = (level: number) => {
    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
    return colors[level - 1] || '#9E9E9E';
  };

  if (isBurning) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <ReanimatedAnimated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.toxicIndicator, { backgroundColor: getToxicLevelColor(grumble.toxic_level) }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.toxicLevel}>
              {TOXIC_LEVEL_LABELS[grumble.toxic_level as keyof typeof TOXIC_LEVEL_LABELS]}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(grumble.posted_at).toLocaleString('ja-JP', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Text style={styles.grumbleText}>{grumble.content}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.vibeInfo}>
              <IconSymbol name="hand.thumbsup.fill" size={16} color="#666" />
              <Text style={styles.vibeCount}>{grumble.vibe_count}</Text>
            </View>
          </View>
        </View>
      </ReanimatedAnimated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toxicIndicator: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toxicLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  grumbleText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vibeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vibeCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});

