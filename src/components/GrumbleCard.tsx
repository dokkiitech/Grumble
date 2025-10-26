import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GrumbleItem } from '../services/grumble.service';
import { TOXIC_LEVEL_LABELS } from '../constants/config';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

interface GrumbleCardProps {
  grumble: GrumbleItem;
  onVibePress: (grumbleId: string) => void;
}

export const GrumbleCard: React.FC<GrumbleCardProps> = ({ grumble, onVibePress }) => {
  const handleVibePress = () => {
    if (!grumble.has_vibed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onVibePress(grumble.grumble_id);
    }
  };

  const getToxicLevelColor = (level: number) => {
    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
    return colors[level - 1] || '#9E9E9E';
  };

  return (
    <View style={styles.card}>
      {/* 毒レベルインジケーター */}
      <View style={[styles.toxicIndicator, { backgroundColor: getToxicLevelColor(grumble.toxic_level) }]} />

      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
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

        {/* 本文 */}
        <Text style={styles.grumbleText}>{grumble.content}</Text>

        {/* フッター */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.vibeButton, grumble.has_vibed && styles.vibeButtonActive]}
            onPress={handleVibePress}
            disabled={grumble.has_vibed}
          >
            <IconSymbol
              name="hand.thumbsup.fill"
              size={20}
              color={grumble.has_vibed ? '#4CAF50' : '#666'}
            />
            <Text style={[styles.vibeText, grumble.has_vibed && styles.vibeTextActive]}>
              わかる…
            </Text>
            <Text style={[styles.vibeCount, grumble.has_vibed && styles.vibeCountActive]}>
              {grumble.vibe_count}
            </Text>
          </Pressable>

          {grumble.is_purified && (
            <View style={styles.purifiedBadge}>
              <IconSymbol name="checkmark.seal.fill" size={16} color="#4CAF50" />
              <Text style={styles.purifiedText}>成仏済み</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vibeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  vibeButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  vibeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  vibeTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  vibeCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
  vibeCountActive: {
    color: '#4CAF50',
  },
  purifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  purifiedText: {
    fontSize: 11,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
});
