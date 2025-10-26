import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Text,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GrumbleCard } from '@/src/components/GrumbleCard';
import { ToxicLevelFilter } from '@/src/components/ToxicLevelFilter';
import { grumbleService, GrumbleItem } from '@/src/services/grumble.service';
import { TimelineParams } from '@/src/services/grumble.service';
import { useUserStore } from '@/src/stores/userStore';

export default function TimelineScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useUserStore();
  const [filter, setFilter] = useState<TimelineParams>({
    limit: 20,
    offset: 0,
    unpurified_only: false,
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // タイムライン取得（認証完了後のみ）
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['timeline', filter],
    queryFn: () => grumbleService.getTimeline(filter),
    enabled: isAuthenticated, // 認証完了後のみクエリを実行
  });

  // 「わかる…」送信
  const vibeMutation = useMutation({
    mutationFn: (grumbleId: string) => grumbleService.addVibe(grumbleId),
    onSuccess: () => {
      // タイムラインを再取得
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
    onError: (error) => {
      console.error('Failed to add vibe:', error);
    },
  });

  const handleVibePress = useCallback((grumbleId: string) => {
    vibeMutation.mutate(grumbleId);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, []);

  const handleApplyFilter = useCallback((minLevel?: number, maxLevel?: number) => {
    setFilter({
      ...filter,
      toxic_level_min: minLevel,
      toxic_level_max: maxLevel,
      offset: 0,
    });
  }, [filter]);

  const renderGrumble = useCallback(({ item }: { item: GrumbleItem }) => (
    <GrumbleCard grumble={item} onVibePress={handleVibePress} />
  ), [handleVibePress]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="tray" size={64} color="#ccc" />
      <Text style={styles.emptyText}>まだ投稿がありません</Text>
      <Text style={styles.emptySubText}>最初の愚痴を吐き出してみましょう!</Text>
    </View>
  );

  const hasActiveFilter = filter.toxic_level_min || filter.toxic_level_max;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>タイムライン</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <IconSymbol
              name={hasActiveFilter ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle"}
              size={28}
              color={hasActiveFilter ? "#4CAF50" : "#666"}
            />
          </Pressable>
          <Pressable
            style={styles.createButton}
            onPress={() => router.push('/create-grumble')}
          >
            <IconSymbol name="plus.circle.fill" size={32} color="#4CAF50" />
          </Pressable>
        </View>
      </View>

      {/* フィルターボタン */}
      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterButton, !filter.unpurified_only && styles.filterButtonActive]}
          onPress={() => setFilter({ ...filter, unpurified_only: false, offset: 0 })}
        >
          <Text style={[styles.filterText, !filter.unpurified_only && styles.filterTextActive]}>
            すべて
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterButton, filter.unpurified_only && styles.filterButtonActive]}
          onPress={() => setFilter({ ...filter, unpurified_only: true, offset: 0 })}
        >
          <Text style={[styles.filterText, filter.unpurified_only && styles.filterTextActive]}>
            未成仏のみ
          </Text>
        </Pressable>
      </View>

      {/* タイムライン */}
      <FlatList
        data={data?.grumbles || []}
        renderItem={renderGrumble}
        keyExtractor={(item) => item.grumble_id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={!isLoading ? renderEmpty : null}
      />

      {/* フィルターモーダル */}
      <ToxicLevelFilter
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilter}
        currentMin={filter.toxic_level_min}
        currentMax={filter.toxic_level_max}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createButton: {
    padding: 4,
  },
  filterButtonStyle: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
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
});
