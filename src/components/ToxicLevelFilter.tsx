import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TOXIC_LEVELS, TOXIC_LEVEL_LABELS } from '../constants/config';
import * as Haptics from 'expo-haptics';

interface ToxicLevelFilterProps {
  visible: boolean;
  onClose: () => void;
  onApply: (minLevel?: number, maxLevel?: number) => void;
  currentMin?: number;
  currentMax?: number;
}

export const ToxicLevelFilter: React.FC<ToxicLevelFilterProps> = ({
  visible,
  onClose,
  onApply,
  currentMin,
  currentMax,
}) => {
  const [minLevel, setMinLevel] = useState<number | undefined>(currentMin);
  const [maxLevel, setMaxLevel] = useState<number | undefined>(currentMax);

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(minLevel, maxLevel);
    onClose();
  };

  const handleReset = () => {
    Haptics.selectionAsync();
    setMinLevel(undefined);
    setMaxLevel(undefined);
  };

  const handleLevelSelect = (level: number, type: 'min' | 'max') => {
    Haptics.selectionAsync();
    if (type === 'min') {
      setMinLevel(level);
      // 最小値が最大値より大きくならないようにする
      if (maxLevel && level > maxLevel) {
        setMaxLevel(level);
      }
    } else {
      setMaxLevel(level);
      // 最大値が最小値より小さくならないようにする
      if (minLevel && level < minLevel) {
        setMinLevel(level);
      }
    }
  };

  const getToxicLevelColor = (level: number) => {
    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
    return colors[level - 1] || '#9E9E9E';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelText}>キャンセル</Text>
          </Pressable>
          <Text style={styles.title}>毒レベルでフィルター</Text>
          <Pressable onPress={handleReset}>
            <Text style={styles.resetText}>リセット</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* 最小レベル */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>最小レベル</Text>
            <View style={styles.levelButtons}>
              {TOXIC_LEVELS.map((level) => (
                <Pressable
                  key={`min-${level}`}
                  style={[
                    styles.levelButton,
                    minLevel === level && styles.levelButtonActive,
                    { borderColor: getToxicLevelColor(level) },
                    minLevel === level && { backgroundColor: getToxicLevelColor(level) },
                  ]}
                  onPress={() => handleLevelSelect(level, 'min')}
                >
                  <Text
                    style={[
                      styles.levelButtonText,
                      minLevel === level && styles.levelButtonTextActive,
                    ]}
                  >
                    Lv.{level}
                  </Text>
                </Pressable>
              ))}
            </View>
            {minLevel && (
              <Text style={styles.levelLabel}>
                {TOXIC_LEVEL_LABELS[minLevel as keyof typeof TOXIC_LEVEL_LABELS]}以上
              </Text>
            )}
          </View>

          {/* 最大レベル */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>最大レベル</Text>
            <View style={styles.levelButtons}>
              {TOXIC_LEVELS.map((level) => (
                <Pressable
                  key={`max-${level}`}
                  style={[
                    styles.levelButton,
                    maxLevel === level && styles.levelButtonActive,
                    { borderColor: getToxicLevelColor(level) },
                    maxLevel === level && { backgroundColor: getToxicLevelColor(level) },
                  ]}
                  onPress={() => handleLevelSelect(level, 'max')}
                >
                  <Text
                    style={[
                      styles.levelButtonText,
                      maxLevel === level && styles.levelButtonTextActive,
                    ]}
                  >
                    Lv.{level}
                  </Text>
                </Pressable>
              ))}
            </View>
            {maxLevel && (
              <Text style={styles.levelLabel}>
                {TOXIC_LEVEL_LABELS[maxLevel as keyof typeof TOXIC_LEVEL_LABELS]}以下
              </Text>
            )}
          </View>

          {/* プレビュー */}
          {(minLevel || maxLevel) && (
            <View style={styles.previewContainer}>
              <IconSymbol name="info.circle" size={20} color="#666" />
              <Text style={styles.previewText}>
                {minLevel && maxLevel
                  ? `Lv.${minLevel} 〜 Lv.${maxLevel} の投稿を表示`
                  : minLevel
                  ? `Lv.${minLevel} 以上の投稿を表示`
                  : `Lv.${maxLevel} 以下の投稿を表示`}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* 適用ボタン */}
        <View style={styles.footer}>
          <Pressable style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>適用する</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  resetText: {
    fontSize: 16,
    color: '#FF5722',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  levelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 70,
    alignItems: 'center',
  },
  levelButtonActive: {
    borderWidth: 2,
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  levelLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginTop: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
