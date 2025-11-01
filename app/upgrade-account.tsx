import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/stores/userStore';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function UpgradeAccountScreen() {
  const router = useRouter();
  const { upgradeAnonymousAccount, firebaseUser } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      onOk?.();
    } else {
      if (onOk) {
        Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
      } else {
        Alert.alert(title, message);
      }
    }
  };

  const handleUpgrade = async () => {
    // バリデーション
    if (!email.trim()) {
      showAlert('エラー', 'メールアドレスを入力してください');
      return;
    }

    if (!password) {
      showAlert('エラー', 'パスワードを入力してください');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('エラー', 'パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      showAlert('エラー', 'パスワードは6文字以上にしてください');
      return;
    }

    setIsLoading(true);

    try {
      await upgradeAnonymousAccount(email.trim(), password);

      showAlert(
        '成功',
        'アカウントの登録が完了しました！\nこれまでのデータは引き継がれています。',
        () => {
          router.back();
        }
      );
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      showAlert('エラー', error.message || 'アカウント登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!firebaseUser?.isAnonymous) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.circle" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>
            このページは匿名ユーザー専用です
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="xmark" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>アカウント登録</Text>
          <Text style={styles.headerSubtitle}>
            データを引き継いでアカウントを作成
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <IconSymbol name="checkmark.shield.fill" size={32} color={Colors.light.tint} />
            <Text style={styles.infoTitle}>データの引き継ぎ</Text>
            <Text style={styles.infoText}>
              これまでの投稿、徳ポイント、称号はすべて引き継がれます。
              アカウント登録後も安心してご利用いただけます。
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>メールアドレス</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>パスワード（6文字以上）</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>パスワード（確認）</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.submitButtonText}>登録中...</Text>
              ) : (
                <>
                  <IconSymbol name="person.badge.plus" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>アカウント登録</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.noteCard}>
            <IconSymbol name="info.circle" size={20} color="#666" />
            <Text style={styles.noteText}>
              登録後、このメールアドレスとパスワードでログインできるようになります。
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
