import { IconSymbol } from '@/components/ui/icon-symbol';
import { TOXIC_LEVEL_LABELS } from '@/src/constants/config';
import { eventService } from '@/src/services/event.service';
import { GrumbleItem } from '@/src/services/grumble.service';
import { useUserStore } from '@/src/stores/userStore';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import ReanimatedAnimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BONFIRE_Y = SCREEN_HEIGHT * 0.25; // 火の位置（上部25%）
const CARD_AREA_Y = SCREEN_HEIGHT * 0.5; // カードエリアの開始位置

export default function OtakinageScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  const [burningCards, setBurningCards] = useState<Set<string>>(new Set());
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [allCompleted, setAllCompleted] = useState(false);
  const bonfireIntensity = useRef(new Animated.Value(0.5)).current;
  const fullScreenFlameAnim = useRef(new Animated.Value(0)).current;
  const fullScreenFlameOpacity = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

  const { data, isLoading } = useQuery({
    queryKey: ['event-grumbles', user?.user_id],
    queryFn: () => eventService.getEventGrumbles(),
    enabled: isAuthenticated && !!user?.user_id,
  });

  const grumbles = data?.grumbles || [];
  const myGrumbles = grumbles.filter((g) => g.user_id === user?.user_id);

  // ============================================
  // 【モックデータ】本番環境では削除
  // ============================================
  // 開発環境でのUI確認用のモックデータ
  // バックエンドと連携する際は、以下のブロック全体を削除
  // ============================================
  const mockGrumbles: GrumbleItem[] =
    __DEV__ && user
      ? [
          {
            grumble_id: 'mock-1',
            user_id: user.user_id,
            content: 'MacBook Pro 高すぎ！',
            toxic_level: 5,
            vibe_count: 12,
            is_purified: false,
            posted_at: new Date().toISOString(),
            expires_at: new Date().toISOString(),
            is_event_grumble: false,
            has_vibed: false,
          },
          {
            grumble_id: 'mock-2',
            user_id: user.user_id,
            content: 'シフト削られたー...',
            toxic_level: 2,
            vibe_count: 4,
            is_purified: false,
            posted_at: new Date().toISOString(),
            expires_at: new Date().toISOString(),
            is_event_grumble: false,
            has_vibed: false,
          },
        ]
      : [];
  // ============================================
  // 【モックデータここまで】
  // ============================================

  // モックデータを使用（本番環境では削除して myGrumbles を直接使用）
  const displayGrumbles = myGrumbles.length > 0 ? myGrumbles : mockGrumbles;
  // 本番環境では上記を以下に置き換えてください:
  // const displayGrumbles = myGrumbles;

  // 全ての投稿が燃え終わったかチェック
  useEffect(() => {
    if (displayGrumbles.length > 0 && completedCards.size === displayGrumbles.length && !allCompleted) {
      setAllCompleted(true);
      
      // 画面全体が燃え上がるエフェクト
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fullScreenFlameAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(fullScreenFlameAnim, {
                toValue: 1.2,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(fullScreenFlameAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
        Animated.timing(fullScreenFlameOpacity, {
          toValue: 0.9,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCards.size, displayGrumbles.length, allCompleted]);

  // 昨日投稿しなかった場合は空の状態を表示
  if (!isLoading && displayGrumbles.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>お焚き上げ</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <IconSymbol name="moon.stars" size={64} color="#ccc" />
          <Text style={styles.emptyText}>昨日は投稿がありませんでした</Text>
          <Text style={styles.emptySubText}>お焚き上げイベントは発生しません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCardBurn = (grumbleId: string) => {
    setBurningCards((prev) => new Set(prev).add(grumbleId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // 燃え盛るエフェクト
    Animated.sequence([
      Animated.timing(bonfireIntensity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(bonfireIntensity, {
        toValue: 0.5,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();

    // アニメーション完了後にカードを削除
    setTimeout(() => {
      setBurningCards((prev) => {
        const next = new Set(prev);
        next.delete(grumbleId);
        return next;
      });
      setCompletedCards((prev) => new Set(prev).add(grumbleId));
    }, 2000);
  };

  const handleBurnAll = () => {
    if (displayGrumbles.length === 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 全てのカードを燃やす
    displayGrumbles.forEach((grumble, index) => {
      setTimeout(() => {
        handleCardBurn(grumble.grumble_id);
      }, index * 150);
    });

    // 燃え盛るエフェクト（最大）
    Animated.sequence([
      Animated.timing(bonfireIntensity, {
        toValue: 1.5,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(bonfireIntensity, {
        toValue: 0.5,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const bonfireScale = bonfireIntensity.interpolate({
    inputRange: [0, 0.5, 1, 1.5],
    outputRange: [1, 1.2, 1.5, 2],
  });

  const bonfireOpacity = bonfireIntensity.interpolate({
    inputRange: [0, 0.5, 1, 1.5],
    outputRange: [0.6, 0.8, 1, 1],
  });

  const fullScreenFlameScale = fullScreenFlameAnim.interpolate({
    inputRange: [0, 1, 1.2],
    outputRange: [0.8, 1, 1.1],
  });

  const handleBackToTimeline = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>お焚き上げ</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 上部：夜空と火 */}
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
        {displayGrumbles.length > 0 && (
          <View style={styles.burnAllButtonContainer}>
            <Pressable
              onPress={handleBurnAll}
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

      {/* 下部：投稿カードエリア */}
      <View style={styles.bottomSection}>
        <ScrollView
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>読み込み中...</Text>
            </View>
          ) : displayGrumbles.length === 0 ? (
            <View style={styles.emptyCardContainer}>
              <Text style={styles.emptyCardText}>全てお焚き上げが完了しました</Text>
            </View>
          ) : (
            displayGrumbles
              .filter((g) => !completedCards.has(g.grumble_id))
              .map((grumble) => (
                <DraggableGrumbleCard
                  key={grumble.grumble_id}
                  grumble={grumble}
                  grumbleId={grumble.grumble_id}
                  onBurn={handleCardBurn}
                  isBurning={burningCards.has(grumble.grumble_id)}
                />
              ))
          )}
        </ScrollView>
      </View>

      {/* 全て完了時の画面全体燃え上がりエフェクト */}
      {allCompleted && (
        <Animated.View
          style={[
            styles.fullScreenFlameOverlay,
            {
              opacity: fullScreenFlameOpacity,
              transform: [{ scale: fullScreenFlameScale }],
            },
          ]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[
              'rgba(255,87,34,0.8)',
              'rgba(255,152,0,0.7)',
              'rgba(255,193,7,0.6)',
              'rgba(255,215,0,0.5)',
              'transparent',
            ]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[
              'rgba(255,107,53,0.7)',
              'rgba(247,147,30,0.6)',
              'rgba(255,193,7,0.5)',
              'transparent',
            ]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[
              'rgba(255,152,0,0.6)',
              'rgba(255,193,7,0.5)',
              'rgba(255,215,0,0.4)',
              'transparent',
            ]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      {/* 完了メッセージとボタン */}
      {allCompleted && (
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
              onPress={handleBackToTimeline}
              style={({ pressed }) => [
                styles.backToTimelineButton,
                pressed && styles.backToTimelineButtonPressed,
              ]}
            >
              <Text style={styles.backToTimelineButtonText}>タイムラインに戻る</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ドラッグ可能な投稿カードコンポーネント
interface DraggableGrumbleCardProps {
  grumble: GrumbleItem;
  grumbleId: string;
  onBurn: (grumbleId: string) => void;
  isBurning: boolean;
}

const DraggableGrumbleCard: React.FC<DraggableGrumbleCardProps> = ({
  grumble,
  grumbleId,
  onBurn,
  isBurning,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const startY = useSharedValue(0);

  // runOnJSで安全に実行するためのラッパー関数
  const safeOnBurn = () => {
    try {
      onBurn(grumbleId);
    } catch (error) {
      console.error('Error in onBurn:', error);
    }
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      startY.value = e.absoluteY;
      scale.value = withSpring(1.1);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
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
    marginBottom: 16, // 下の投稿エリアとの間にスペースを開ける
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
  bottomSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 40, // ボタンとの間にスペースを確保（20 → 40に増加）
  },
  cardsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  emptyCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCardText: {
    fontSize: 16,
    color: '#999',
  },
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
  fullScreenFlameOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
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

