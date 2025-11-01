import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GrumbleItem } from '../services/grumble.service';
import { TOXIC_LEVEL_LABELS, PURIFICATION_THRESHOLD } from '../constants/config';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { VibeAnimation } from './VibeAnimation';
import { JobutsuAnimation } from './JobutsuAnimation';
import { AppFonts } from '@/constants/theme';

interface GrumbleCardProps {
  grumble: GrumbleItem;
  onVibePress: (grumbleId: string) => void;
  onJobutsu?: (grumbleId: string) => void;
  currentUserId?: string; // 現在のユーザーID
}

export const GrumbleCard: React.FC<GrumbleCardProps> = ({ grumble, onVibePress, onJobutsu, currentUserId }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showJobutsuAnimation, setShowJobutsuAnimation] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // デバッグ用ログ
  console.log(`GrumbleCard ${grumble.grumble_id}:`, {
    has_vibed: grumble.has_vibed,
    vibe_count: grumble.vibe_count,
    user_id: grumble.user_id,
    currentUserId,
  });

  // 自分の投稿かどうか
  const isOwnGrumble = currentUserId && grumble.user_id === currentUserId;

  // わかるボタンを押せるかどうか（自分の投稿以外で、まだ押していない場合）
  const canVibe = !isOwnGrumble && !grumble.has_vibed;

  // 成仏ボタンを押せるかどうか（自分の投稿のみ）
  const canJobutsu = isOwnGrumble && !grumble.is_purified && grumble.vibe_count >= PURIFICATION_THRESHOLD;

  // 成仏ボタンを表示するかどうか（自分の投稿のみ）
  const showJobutsuButton = isOwnGrumble && !grumble.is_purified;

  const handleVibePress = () => {
    // 自分の投稿には「わかる…」を押せない
    if (isOwnGrumble) {
      return;
    }

    if (!grumble.has_vibed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowAnimation(true);
      onVibePress(grumble.grumble_id);
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  const handleJobutsuPress = () => {
    if (!grumble.is_purified && grumble.vibe_count >= PURIFICATION_THRESHOLD) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowJobutsuAnimation(true);
      setIsRemoving(true);
    }
  };

  const handleJobutsuComplete = () => {
    setShowJobutsuAnimation(false);
    onJobutsu?.(grumble.grumble_id);
  };

  const getToxicLevelColor = (level: number) => {
    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
    return colors[level - 1] || '#9E9E9E';
  };

  // アニメーション中は非表示にする
  if (isRemoving && !showJobutsuAnimation) {
    return null;
  }

  return (
    <View style={styles.card}>
      {/* 成仏アニメーション */}
      {showJobutsuAnimation && (
        <JobutsuAnimation onComplete={handleJobutsuComplete} />
      )}

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
          <View style={styles.vibeButtonContainer}>
            <Pressable
              style={[
                styles.vibeButton,
                grumble.has_vibed && styles.vibeButtonActive,
                isOwnGrumble && styles.vibeButtonDisabled
              ]}
              onPress={handleVibePress}
              disabled={!canVibe}
            >
              <IconSymbol
                name="hand.thumbsup.fill"
                size={20}
                color={grumble.has_vibed ? '#FF3B30' : isOwnGrumble ? '#CCC' : '#666'}
              />
              <Text style={[
                styles.vibeText,
                grumble.has_vibed && styles.vibeTextActive,
                isOwnGrumble && styles.vibeTextDisabled
              ]}>
                わかる…
              </Text>
              <Text style={[
                styles.vibeCount,
                grumble.has_vibed && styles.vibeCountActive,
                isOwnGrumble && styles.vibeCountDisabled
              ]}>
                {grumble.vibe_count}
              </Text>
            </Pressable>
            {showAnimation && <VibeAnimation onComplete={handleAnimationComplete} />}
          </View>

          {grumble.is_purified ? (
            <View style={styles.purifiedBadge}>
              <IconSymbol name="checkmark.seal.fill" size={16} color="#4CAF50" />
              <Text style={styles.purifiedText}>成仏済み</Text>
            </View>
          ) : showJobutsuButton ? (
            <Pressable
              style={[
                styles.jobutsuButton,
                !canJobutsu && styles.jobutsuButtonDisabled
              ]}
              onPress={handleJobutsuPress}
              disabled={!canJobutsu}
            >
              <IconSymbol
                name="flame.fill"
                size={18}
                color={canJobutsu ? "#FF5722" : "#CCC"}
              />
              <Text style={[
                styles.jobutsuButtonText,
                !canJobutsu && styles.jobutsuButtonTextDisabled
              ]}>
                成仏させる {!canJobutsu && `(${grumble.vibe_count}/${PURIFICATION_THRESHOLD})`}
              </Text>
            </Pressable>
          ) : null}
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
    fontFamily: AppFonts.regular,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vibeButtonContainer: {
    position: 'relative',
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
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  vibeButtonDisabled: {
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
  vibeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  vibeTextActive: {
    color: '#FF3B30',
    fontWeight: '700',
  },
  vibeTextDisabled: {
    color: '#CCC',
  },
  vibeCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
  vibeCountActive: {
    color: '#FF3B30',
    fontWeight: '700',
  },
  vibeCountDisabled: {
    color: '#CCC',
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
  jobutsuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    gap: 4,
  },
  jobutsuButtonDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  jobutsuButtonText: {
    fontSize: 12,
    color: '#FF5722',
    fontWeight: '600',
  },
  jobutsuButtonTextDisabled: {
    color: '#999',
  },
});
