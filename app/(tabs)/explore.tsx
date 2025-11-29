import { IconSymbol } from '@/components/ui/icon-symbol';
import { EventItem, eventService } from '@/src/services/event.service';
import { useUserStore } from '@/src/stores/userStore';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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
import { SafeAreaView } from 'react-native-safe-area-context';

// JST（日本時間）で現在時刻を取得し、0:00〜12:00の間かどうかを判定
// 開発環境では常にtrueを返す（UI確認用）
const isEventTime = (): boolean => {
  // 開発環境では常に表示（本番環境ではコメントアウトを外す）
  if (__DEV__) {
    return true;
  }
  
  const now = new Date();
  const jstTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const hour = jstTime.getHours();
  return hour >= 0 && hour < 12;
};

export default function EventScreen() {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const [isEventActive, setIsEventActive] = useState(isEventTime());

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getEvents(true),
    enabled: isAuthenticated, // 認証完了後のみクエリを実行
  });

  const activeEvent = data?.events?.find((e) => e.is_active);

  // 時間判定を定期的に更新（1分ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      setIsEventActive(isEventTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleEventStart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/otakinage');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <IconSymbol name="flame.fill" size={28} color="#FF5722" />
        <Text style={styles.title}>イベント</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        ) : activeEvent ? (
          <EventCard event={activeEvent} />
        ) : (
          <View style={styles.emptyContainer}>
            <IconSymbol name="moon.stars" size={64} color="#ccc" />
            <Text style={styles.emptyText}>現在開催中のイベントはありません</Text>
            <Text style={styles.emptySubText}>次のイベントをお待ちください</Text>
          </View>
        )}

        {/* イベントスタートボタン（0:00〜12:00の間のみ表示） */}
        {isEventActive && (
          <EventStartButton onPress={handleEventStart} />
        )}

        {/* お焚き上げの説明 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>お焚き上げとは?</Text>
          <Text style={styles.infoText}>
            毎日深夜0時に、その日の愚痴を浄化する儀式です。
          </Text>
          <Text style={styles.infoText}>
            集まった愚痴の数だけ、大きな炎で燃やされます。
          </Text>
          <Text style={styles.infoText}>
            みんなで愚痴を吐き出して、心をスッキリさせましょう!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface EventCardProps {
  event: EventItem;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const flameAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 炎のアニメーション
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const flameScale = flameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const flameOpacity = flameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const isOtakinage = event.event_type === 'OTAKINAGE';
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  return (
    <View style={styles.eventCard}>
      <LinearGradient
        colors={isOtakinage ? ['#FF5722', '#FF9800'] : ['#9C27B0', '#E91E63']}
        style={styles.eventGradient}
      >
        {/* 炎のアイコン */}
        <Animated.View
          style={[
            styles.flameContainer,
            {
              transform: [{ scale: flameScale }],
              opacity: flameOpacity,
            },
          ]}
        >
          <IconSymbol
            name={isOtakinage ? 'flame.fill' : 'bolt.fill'}
            size={80}
            color="#fff"
          />
        </Animated.View>

        {/* イベント名 */}
        <Text style={styles.eventName}>{event.event_name}</Text>

        {/* イベント期間 */}
        <View style={styles.eventTimeContainer}>
          <IconSymbol name="clock.fill" size={16} color="#fff" />
          <Text style={styles.eventTimeText}>
            {startTime.toLocaleString('ja-JP', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            ~{' '}
            {endTime.toLocaleString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* お焚き上げの説明 */}
        {isOtakinage && (
          <View style={styles.eventDescription}>
            <Text style={styles.eventDescriptionText}>
              深夜0時に全ての愚痴が浄化されます
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

// イベントスタートボタンコンポーネント（燃えるエフェクト付き）
interface EventStartButtonProps {
  onPress: () => void;
}

const EventStartButton: React.FC<EventStartButtonProps> = ({ onPress }) => {
  const flameAnim1 = useRef(new Animated.Value(0)).current;
  const flameAnim2 = useRef(new Animated.Value(0)).current;
  const flameAnim3 = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 複数の炎エフェクトを非同期でアニメーション
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(flameAnim1, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim1, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(flameAnim2, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim2, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(flameAnim3, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim3, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 揺れ動くアニメーション
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ])
    ).start();
  }, []);

  const flame1Scale = flameAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  const flame1Opacity = flameAnim1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  const flame2Scale = flameAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });
  const flame2Opacity = flameAnim2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.9, 0.5],
  });

  const flame3Scale = flameAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });
  const flame3Opacity = flameAnim3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.8, 0.4],
  });

  const shakeTranslateX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-3, 0, 3],
  });

  return (
    <View style={styles.startButtonContainer}>
      {/* 炎エフェクト（背景） */}
      <Animated.View
        style={[
          styles.flameEffect1,
          {
            transform: [{ scale: flame1Scale }],
            opacity: flame1Opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.flameEffect2,
          {
            transform: [{ scale: flame2Scale }],
            opacity: flame2Opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.flameEffect3,
          {
            transform: [{ scale: flame3Scale }],
            opacity: flame3Opacity,
          },
        ]}
      />

      {/* ボタン本体 */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.startButton,
          pressed && styles.startButtonPressed,
        ]}
      >
        <Animated.View
          style={[
            styles.startButtonInner,
            {
              transform: [{ translateX: shakeTranslateX }],
            },
          ]}
        >
          <LinearGradient
            colors={['#FF5722', '#FF9800', '#FFC107']}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol name="flame.fill" size={32} color="#fff" />
            <Text style={styles.startButtonText}>イベントスタート</Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 16,
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
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  eventGradient: {
    padding: 32,
    alignItems: 'center',
  },
  flameContainer: {
    marginBottom: 16,
  },
  eventName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  eventTimeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  eventDescription: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  eventDescriptionText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  startButtonContainer: {
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  flameEffect1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 87, 34, 0.4)',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  flameEffect2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 152, 0, 0.35)',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 25,
    elevation: 8,
  },
  flameEffect3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 6,
  },
  startButton: {
    width: 240,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  startButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  startButtonInner: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
});
