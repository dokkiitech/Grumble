import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { grumbleService } from '@/src/services/grumble.service';
import { TOXIC_LEVELS, TOXIC_LEVEL_LABELS, MAX_GRUMBLE_LENGTH } from '@/src/constants/config';
import * as Haptics from 'expo-haptics';

export default function CreateGrumbleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [toxicLevel, setToxicLevel] = useState<1 | 2 | 3 | 4 | 5>(3);

  const createMutation = useMutation({
    mutationFn: () =>
      grumbleService.createGrumble({
        content,
        toxic_level: toxicLevel,
        is_event_grumble: false,
      }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      router.back();
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('エラー', '投稿に失敗しました。もう一度お試しください。');
      console.error('Failed to create grumble:', error);
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('入力エラー', '愚痴を入力してください');
      return;
    }

    if (content.length > MAX_GRUMBLE_LENGTH) {
      Alert.alert('入力エラー', `${MAX_GRUMBLE_LENGTH}文字以内で入力してください`);
      return;
    }

    createMutation.mutate();
  };

  const handleToxicLevelSelect = (level: 1 | 2 | 3 | 4 | 5) => {
    Haptics.selectionAsync();
    setToxicLevel(level);
  };

  const getToxicLevelColor = (level: number) => {
    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
    return colors[level - 1] || '#9E9E9E';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </Pressable>
            <Text style={styles.title}>愚痴を吐き出す</Text>
            <Pressable
              onPress={handleSubmit}
              disabled={createMutation.isPending || !content.trim()}
            >
              <Text
                style={[
                  styles.submitText,
                  (!content.trim() || createMutation.isPending) && styles.submitTextDisabled,
                ]}
              >
                {createMutation.isPending ? '送信中...' : '投稿'}
              </Text>
            </Pressable>
          </View>

          {/* 本文入力 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="ここに愚痴を吐き出してください..."
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={MAX_GRUMBLE_LENGTH}
              autoFocus
            />
            <Text style={styles.charCount}>
              {content.length} / {MAX_GRUMBLE_LENGTH}
            </Text>
          </View>

          {/* 毒レベル選択 */}
          <View style={styles.toxicLevelContainer}>
            <Text style={styles.sectionTitle}>毒レベルを選択</Text>
            <View style={styles.toxicLevelButtons}>
              {TOXIC_LEVELS.map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.toxicLevelButton,
                    toxicLevel === level && styles.toxicLevelButtonActive,
                    { borderColor: getToxicLevelColor(level) },
                    toxicLevel === level && { backgroundColor: getToxicLevelColor(level) },
                  ]}
                  onPress={() => handleToxicLevelSelect(level)}
                >
                  <Text
                    style={[
                      styles.toxicLevelText,
                      toxicLevel === level && styles.toxicLevelTextActive,
                    ]}
                  >
                    Lv.{level}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.toxicLevelLabel}>
              {TOXIC_LEVEL_LABELS[toxicLevel]}
            </Text>
          </View>

          {/* 説明 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              投稿した愚痴は24時間後に自動的に削除されます。
            </Text>
            <Text style={styles.infoText}>
              「わかる…」が一定数集まると成仏します。
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  submitTextDisabled: {
    color: '#ccc',
  },
  inputContainer: {
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  toxicLevelContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  toxicLevelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  toxicLevelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  toxicLevelButtonActive: {
    borderWidth: 2,
  },
  toxicLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toxicLevelTextActive: {
    color: '#fff',
  },
  toxicLevelLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    marginTop: 'auto',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    marginBottom: 4,
  },
});
