import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { eventService, EventItem } from '@/src/services/event.service';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '@/src/stores/userStore';

export default function EventScreen() {
  const { isAuthenticated } = useUserStore();

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getEvents(true),
    enabled: isAuthenticated, // 認証完了後のみクエリを実行
  });

  const activeEvent = data?.events?.find((e) => e.is_active);

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
});
