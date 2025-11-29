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
import { grumbleService } from '@/src/services/grumble.service';

export default function StatisticsScreen() {
  const router = useRouter();
  const [range, setRange] = useState<'today' | 'week' | 'month'>('today');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['statistics'],
    queryFn: () => grumbleService.getTimeline({ limit: 200 }),
  });

  const filtered = useMemo(() => {
    if (!data?.grumbles) return [] as typeof data.grumbles | [];
    const now = new Date();

    const start = (() => {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      if (range === 'today') return d;
      if (range === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - 6); // 過去7日分
        return weekStart;
      }
      // month
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      return monthStart;
    })();

    return data.grumbles.filter((g) => new Date(g.posted_at) >= start);
  }, [data?.grumbles, range]);

  const total = filtered.length;
  const purified = filtered.filter((g) => g.is_purified).length;
  const unpurified = total - purified;
  const totalVibes = filtered.reduce((sum, g) => sum + g.vibe_count, 0);

  const toxicBuckets = [1, 2, 3, 4, 5].map((level) => ({
    level,
    count: filtered.filter((g) => g.toxic_level === level).length,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color="#333" />
        </Pressable>
        <Text style={styles.title}>統計情報</Text>
        <Pressable style={styles.refreshButton} onPress={() => refetch()}>
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

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <IconSymbol name="exclamationmark.triangle.fill" size={22} color="#FF3B30" />
          <Text style={styles.errorText}>統計を取得できませんでした</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
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
