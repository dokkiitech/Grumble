import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { grumbleService } from '../../src/services/grumble.service';
import { useUserStore } from '../../src/stores/userStore';
import { GrumbleCard } from '../../src/components/GrumbleCard';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOCK_CURRENT_USER_ID } from '../../src/mocks/data';

export default function AccountScreen() {
  const router = useRouter();
  const { isAuthenticated, user, firebaseUser } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);

  // Mockモードでは現在のユーザーIDを使用
  const currentUserId = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true'
    ? MOCK_CURRENT_USER_ID
    : user?.user_id;

  // 統計情報用：全投稿を取得
  const { data: allGrumblesData } = useQuery({
    queryKey: ['my-all-grumbles', currentUserId],
    queryFn: () => grumbleService.getTimeline({
      user_id: currentUserId,
    }),
    enabled: isAuthenticated && !!currentUserId,
  });

  // 表示用：未成仏の投稿のみ取得
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-grumbles', currentUserId],
    queryFn: () => grumbleService.getTimeline({
      user_id: currentUserId,
      unpurified_only: true // 未成仏の投稿のみ表示
    }),
    enabled: isAuthenticated && !!currentUserId,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handlePurifiedPress = () => {
    router.push('/purified-grumbles');
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
  const allGrumbles = allGrumblesData?.grumbles || [];
  const totalGrumbles = allGrumbles.length;
  const purifiedCount = allGrumbles.filter((g) => g.is_purified).length;
  const totalVibes = allGrumbles.reduce((sum, g) => sum + g.vibe_count, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <IconSymbol name="person.circle.fill" size={64} color={Colors.light.tint} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {firebaseUser?.isAnonymous ? '匿名ユーザー' : firebaseUser?.email || 'ユーザー'}
              </Text>
              {user?.profile_title && (
                <Text style={styles.userTitle}>{user.profile_title}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
          >
            <IconSymbol name="gear" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* 統計情報 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalGrumbles}</Text>
            <Text style={styles.statLabel}>投稿</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={handlePurifiedPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.statValue, styles.statValueLink]}>{purifiedCount}</Text>
            <Text style={[styles.statLabel, styles.statLabelLink]}>成仏済み</Text>
            <IconSymbol name="chevron.right" size={12} color="#FF5722" style={styles.statChevron} />
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalVibes}</Text>
            <Text style={styles.statLabel}>わかる数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.virtue_points || 0}</Text>
            <Text style={styles.statLabel}>徳pt</Text>
          </View>
        </View>
      </View>

      {/* 投稿一覧 */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>あなたの投稿</Text>

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
            <IconSymbol name="text.bubble" size={64} color="#CCC" />
            <Text style={styles.emptyText}>まだ投稿がありません</Text>
            <Text style={styles.emptySubtext}>
              愚痴を吐き出してスッキリしましょう
            </Text>
          </View>
        ) : (
          <FlatList
            data={grumbles}
            keyExtractor={(item) => item.grumble_id}
            renderItem={({ item }) => (
              <GrumbleCard grumble={item} onVibePress={handleVibePress} />
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userTitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statValueLink: {
    color: '#FF5722',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statLabelLink: {
    color: '#FF5722',
    fontWeight: '600',
  },
  statChevron: {
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 12,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 8,
    textAlign: 'center',
  },
});
