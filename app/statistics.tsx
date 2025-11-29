import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { statsService, StatsParams, GrumbleStatsBucket, GrumbleStatsToxicBucket } from '@/src/services/stats.service';
import { useUserStore } from '@/src/stores/userStore';

export default function StatisticsScreen() {
  const router = useRouter();
  const [range, setRange] = useState<'today' | 'week' | 'month'>('today');
  const { isAuthenticated, isLoading: authLoading } = useUserStore();

  const { params } = useMemo(() => buildParams(range), [range]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['statistics', params],
    queryFn: () => statsService.getGrumbleStats(params),
    enabled: isAuthenticated, // トークン未設定時の401回避
  });

  const { data: toxicData, isLoading: toxicLoading, isError: toxicError, refetch: refetchToxic } = useQuery({
    queryKey: ['statistics-toxic', params],
    queryFn: () => statsService.getGrumbleStatsToxic(params),
    enabled: isAuthenticated,
  });

  const aggregated = useMemo(() => reduceBuckets(data || [], toxicData || []), [data, toxicData]);
  const { total, purified, unpurified, totalVibes, toxicBuckets } = aggregated;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color="#333" />
        </Pressable>
        <Text style={styles.title}>統計情報</Text>
        <Pressable style={styles.refreshButton} onPress={() => { refetch(); refetchToxic(); }}>
          <IconSymbol name="arrow.clockwise" size={20} color="#333" />
        </Pressable>
      </View>

      {/* タブ */}
      <View style={styles.tabs}>
        {['today', 'week', 'month'].map((key) => {
          const label = key === 'today' ? '今日' : key === 'week' ? '今週' : '今月';
          const active = range === key;
          return (
            <Pressable
              key={key}
              style={[styles.tabButton, active && styles.tabButtonActive]}
              onPress={() => setRange(key as typeof range)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {authLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingText}>認証を確認しています...</Text>
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.center}>
          <IconSymbol name="lock" size={22} color="#666" />
          <Text style={styles.errorText}>統計を見るにはログインが必要です</Text>
        </View>
      ) : isLoading || toxicLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : isError || toxicError ? (
        <View style={styles.center}>
          <IconSymbol name="exclamationmark.triangle.fill" size={22} color="#FF3B30" />
          <Text style={styles.errorText}>統計を取得できませんでした</Text>
          <Pressable style={styles.retryButton} onPress={() => { refetch(); refetchToxic(); }}>
            <Text style={styles.retryText}>再読み込み</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.cardRow}>
            <StatCard label="総投稿数" value={total} accent="#4CAF50" icon="text.bubble" />
            <StatCard label="成仏済み" value={purified} accent="#FF5722" icon="flame.fill" />
          </View>

          <View style={styles.cardRow}>
            <StatCard label="未成仏" value={unpurified} accent="#607D8B" icon="moon.zzz.fill" />
            <StatCard label="わかる総数" value={totalVibes} accent="#FF3B30" icon="hand.thumbsup.fill" />
          </View>

          <View style={styles.sectionHeader}>
            <IconSymbol name="chart.bar.fill" size={18} color="#333" />
            <Text style={styles.sectionTitle}>毒レベル別内訳</Text>
          </View>

          <View style={styles.bucketList}>
            {toxicBuckets.map(({ level, count }) => (
              <View key={level} style={styles.bucketItem}>
                <View style={[styles.bucketBadge, { backgroundColor: levelColor(level) }]}>
                  <Text style={styles.bucketBadgeText}>Lv.{level}</Text>
                </View>
                <Text style={styles.bucketCount}>{count} 件</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  accent: string;
  icon: string;
};

const StatCard: React.FC<StatCardProps> = ({ label, value, accent, icon }) => (
  <View style={[styles.statCard, { borderColor: accent }]}> 
    <View style={styles.statHeader}>
      <IconSymbol name={icon} size={18} color={accent} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
  </View>
);

const levelColor = (level: number) => {
  const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
  return colors[level - 1] || '#9E9E9E';
};

function buildParams(range: 'today' | 'week' | 'month'): { params: StatsParams; tz: string } {
  // サーバー側の集計バケットに確実にヒットさせるため、境界はUTC 0:00/終端を送る。
  const tz = 'UTC';

  const now = new Date();
  const utcStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  let fromMs = utcStartMs;
  let toMs = utcStartMs;

  if (range === 'today') {
    toMs = utcStartMs + 24 * 60 * 60 * 1000;
  } else if (range === 'week') {
    fromMs = utcStartMs - 6 * 24 * 60 * 60 * 1000; // 過去7日分
    toMs = utcStartMs + 24 * 60 * 60 * 1000;
  } else {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    fromMs = Date.UTC(year, month, 1);
    toMs = Date.UTC(year, month + 1, 1);
  }

  const params: StatsParams = {
    granularity: range === 'month' ? 'month' : range === 'week' ? 'week' : 'day',
    from: new Date(fromMs).toISOString(),
    to: new Date(toMs).toISOString(),
    tz,
  };

  return { params, tz };
}

function reduceBuckets(buckets: GrumbleStatsBucket[], toxicBucketsRaw: GrumbleStatsToxicBucket[]) {
  const totals = buckets.reduce(
    (acc, b) => {
      acc.total += b.purified_count + b.unpurified_count;
      acc.purified += b.purified_count;
      acc.unpurified += b.unpurified_count;
      acc.totalVibes += b.total_vibes;
      return acc;
    },
    { total: 0, purified: 0, unpurified: 0, totalVibes: 0 }
  );

  // 毒度別バケットをレベルごとに集計
  const toxicBucketsMap = toxicBucketsRaw.reduce<Record<number, number>>((acc, b) => {
    acc[b.toxic_level] = (acc[b.toxic_level] || 0) + b.purified_count + b.unpurified_count;
    return acc;
  }, {});

  const toxicBuckets = [1, 2, 3, 4, 5].map((level) => ({
    level,
    count: toxicBucketsMap[level] || 0,
  }));

  return { ...totals, toxicBuckets };
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
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 6,
  },
  refreshButton: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
  },
  retryText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  bucketList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  bucketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  bucketBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bucketBadgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  bucketCount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});
