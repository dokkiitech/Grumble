import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { grumbleService, GrumbleItem } from '../src/services/grumble.service';
import { useUserStore } from '../src/stores/userStore';
import { GrumbleCard } from '../src/components/GrumbleCard';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOCK_CURRENT_USER_ID } from '../src/mocks/data';

export default function PurifiedGrumblesScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);

  // Mockモードでは現在のユーザーIDを使用
  const currentUserId = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true'
    ? MOCK_CURRENT_USER_ID
    : user?.user_id;

  // 自分の成仏済み投稿のみ取得
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['purified-grumbles', currentUserId],
    queryFn: () => grumbleService.getTimeline({
      user_id: currentUserId,
      unpurified_only: false // すべて取得してフィルタリング
    }),
    enabled: isAuthenticated && !!currentUserId,
    select: (data) => ({
      ...data,
      // 成仏済みのみフィルタリング
      grumbles: data?.grumbles?.filter((g: GrumbleItem) => g.is_purified) || []
    }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleVibePress = async (grumbleId: string) => {
    try {
      await grumbleService.addVibe(grumbleId);
      refetch();
    } catch (error) {
      console.error('Failed to add vibe:', error);
    }
  };

  const grumbles = data?.grumbles || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>成仏済みの投稿</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 説明 */}
      <View style={styles.descriptionContainer}>
        <IconSymbol name="flame.fill" size={20} color="#FF5722" />
        <Text style={styles.description}>
          あなたが成仏させた愚痴の記録です
        </Text>
      </View>

      {/* 投稿一覧 */}
      {isLoading && !refreshing ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>エラーが発生しました</Text>
        </View>
      ) : grumbles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="sparkles" size={80} color="#DDD" />
          <Text style={styles.emptyText}>まだ成仏済みの投稿がありません</Text>
          <Text style={styles.emptySubtext}>
            愚痴を投稿して、スッキリしたら成仏させましょう
          </Text>
        </View>
      ) : (
        <FlatList
          data={grumbles}
          keyExtractor={(item) => item.grumble_id}
          renderItem={({ item }) => (
            <GrumbleCard
              grumble={item}
              onVibePress={handleVibePress}
              currentUserId={currentUserId}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.light.tint}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF9E6',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  description: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 24,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
});
