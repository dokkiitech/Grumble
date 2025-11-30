import { IconSymbol } from '@/components/ui/icon-symbol';
import { BonfireSection } from '@/src/components/BonfireSection';
import { CompletionMessage } from '@/src/components/CompletionMessage';
import { DraggableGrumbleCard } from '@/src/components/DraggableGrumbleCard';
import { FullScreenFlameEffect } from '@/src/components/FullScreenFlameEffect';
import { eventService } from '@/src/services/event.service';
import { GrumbleItem } from '@/src/services/grumble.service';
import { useUserStore } from '@/src/stores/userStore';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReanimatedAnimated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DraggingCard {
  grumbleId: string;
  grumble: GrumbleItem;
  x: number;
  y: number;
  initialX: number;
  initialY: number;
}

export default function OtakinageScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  const [burningCards, setBurningCards] = useState<Set<string>>(new Set());
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [allCompleted, setAllCompleted] = useState(false);
  const [messageReady, setMessageReady] = useState(false);
  const [draggingCard, setDraggingCard] = useState<DraggingCard | null>(null);
  const [draggingCardIds, setDraggingCardIds] = useState<Set<string>>(new Set());
  const bonfireIntensity = useRef(new Animated.Value(0.5)).current;
  
  // オーバーレイ用のアニメーション値
  const overlayTranslateX = useSharedValue(0);
  const overlayTranslateY = useSharedValue(0);
  const overlayScale = useSharedValue(1);

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
    }
  }, [completedCards.size, displayGrumbles.length, allCompleted]);

  // オーバーレイ用のアニメーションスタイル（早期リターンの前に配置）
  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: overlayTranslateX.value },
        { translateY: overlayTranslateY.value },
        { scale: overlayScale.value },
      ],
    };
  });

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


  const handleBackToTimeline = () => {
    router.replace('/(tabs)');
  };

  // ドラッグ開始時のハンドラー
  const handleDragStart = (grumbleId: string, x: number, y: number) => {
    const grumble = displayGrumbles.find((g) => g.grumble_id === grumbleId);
    if (grumble) {
      // カードの中心位置を計算（カードのサイズを考慮）
      const cardWidth = 350; // カードの幅（概算）
      const cardHeight = 120; // カードの高さ（概算）
      const centerX = x - cardWidth / 2;
      const centerY = y - cardHeight / 2;
      
      setDraggingCard({ 
        grumbleId, 
        grumble, 
        x: centerX, 
        y: centerY,
        initialX: centerX,
        initialY: centerY,
      });
      setDraggingCardIds((prev) => new Set(prev).add(grumbleId));
      overlayTranslateX.value = 0;
      overlayTranslateY.value = 0;
      overlayScale.value = 1.1;
    }
  };

  // ドラッグ更新時のハンドラー
  const handleDragUpdate = (grumbleId: string, x: number, y: number) => {
    if (draggingCard && draggingCard.grumbleId === grumbleId) {
      // カードの中心位置を計算（カードのサイズを考慮）
      const cardWidth = 350; // カードの幅（概算）
      const cardHeight = 120; // カードの高さ（概算）
      const centerX = x - cardWidth / 2;
      const centerY = y - cardHeight / 2;
      
      // オーバーレイの位置を更新（初期位置からの差分を計算）
      overlayTranslateX.value = centerX - draggingCard.initialX;
      overlayTranslateY.value = centerY - draggingCard.initialY;
      
      // 状態も更新
      setDraggingCard((prev) => prev ? { ...prev, x: centerX, y: centerY } : null);
    }
  };

  // ドラッグ終了時のハンドラー
  const handleDragEnd = (grumbleId: string) => {
    setDraggingCardIds((prev) => {
      const next = new Set(prev);
      next.delete(grumbleId);
      return next;
    });
    // 少し遅延させてからオーバーレイを削除（アニメーション完了を待つ）
    setTimeout(() => {
      if (draggingCard?.grumbleId === grumbleId) {
        setDraggingCard(null);
        overlayTranslateX.value = 0;
        overlayTranslateY.value = 0;
        overlayScale.value = 1;
      }
    }, 100);
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
      <View style={styles.topSectionWrapper}>
        <BonfireSection
          bonfireIntensity={bonfireIntensity}
          onBurnAll={handleBurnAll}
          hasGrumbles={displayGrumbles.length > 0}
        />
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
                  onDragStart={handleDragStart}
                  onDragUpdate={handleDragUpdate}
                  onDragEnd={handleDragEnd}
                  isDragging={draggingCardIds.has(grumble.grumble_id)}
                />
              ))
          )}
        </ScrollView>
      </View>

      {/* 全て完了時の画面全体燃え上がりエフェクト */}
      <FullScreenFlameEffect
        isActive={allCompleted}
        onMessageReady={() => setMessageReady(true)}
      />

      {/* 完了メッセージとボタン */}
      <CompletionMessage
        isVisible={messageReady}
        onBackToTimeline={handleBackToTimeline}
      />

      {/* ドラッグ中のカードのオーバーレイ */}
      {draggingCard && (
        <View style={styles.overlay} pointerEvents="none">
          <ReanimatedAnimated.View
            style={[
              styles.overlayCard,
              {
                left: draggingCard.initialX,
                top: draggingCard.initialY,
              },
              overlayAnimatedStyle,
            ]}
          >
            <View
              style={[
                styles.toxicIndicator,
                {
                  backgroundColor: (() => {
                    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
                    return colors[draggingCard.grumble.toxic_level - 1] || '#9E9E9E';
                  })(),
                },
              ]}
            />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.toxicLevel}>
                  {(() => {
                    const TOXIC_LEVEL_LABELS = {
                      1: 'ほぼ無毒',
                      2: '軽度',
                      3: '中度',
                      4: '高度',
                      5: '劇毒',
                    };
                    return TOXIC_LEVEL_LABELS[draggingCard.grumble.toxic_level as keyof typeof TOXIC_LEVEL_LABELS];
                  })()}
                </Text>
                <Text style={styles.timestamp}>
                  {new Date(draggingCard.grumble.posted_at).toLocaleString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.grumbleText}>{draggingCard.grumble.content}</Text>
              <View style={styles.cardFooter}>
                <View style={styles.vibeInfo}>
                  <IconSymbol name="hand.thumbsup.fill" size={16} color="#666" />
                  <Text style={styles.vibeCount}>{draggingCard.grumble.vibe_count}</Text>
                </View>
              </View>
            </View>
          </ReanimatedAnimated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

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
  bottomSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 40,
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
  topSectionWrapper: {
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    pointerEvents: 'none',
    elevation: 10000, // Android用
  },
  overlayCard: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: 350,
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

