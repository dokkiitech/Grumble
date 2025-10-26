import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/src/stores/userStore';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const { signInAnonymously, signInWithEmail, signUpWithEmail, isLoading, error } =
    useUserStore();

  const handleAnonymousSignIn = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signInAnonymously();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('エラー', 'ログインに失敗しました');
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('エラー', error.message || '認証に失敗しました');
    }
  };

  const toggleMode = () => {
    Haptics.selectionAsync();
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ロゴ・タイトル */}
          <View style={styles.header}>
            <IconSymbol name="flame.fill" size={64} color="#FF5722" />
            <Text style={styles.title}>Grumble</Text>
            <Text style={styles.subtitle}>愚痴を吐き出して、心を軽くしよう</Text>
          </View>

          {/* 匿名ログインボタン */}
          <Pressable
            style={styles.anonymousButton}
            onPress={handleAnonymousSignIn}
            disabled={isLoading}
          >
            <IconSymbol name="person.crop.circle" size={24} color="#fff" />
            <Text style={styles.anonymousButtonText}>匿名で始める</Text>
          </Pressable>

          {/* 区切り線 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>または</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* メール認証フォーム */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {mode === 'signin' ? 'ログイン' : '新規登録'}
            </Text>

            {mode === 'signup' && (
              <View style={styles.inputContainer}>
                <IconSymbol name="person" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="表示名（任意）"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <IconSymbol name="envelope" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="メールアドレス"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="lock" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="パスワード（6文字以上）"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <IconSymbol name="exclamationmark.triangle" size={16} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={[styles.authButton, isLoading && styles.authButtonDisabled]}
              onPress={handleEmailAuth}
              disabled={isLoading}
            >
              <Text style={styles.authButtonText}>
                {isLoading
                  ? '処理中...'
                  : mode === 'signin'
                  ? 'ログイン'
                  : '新規登録'}
              </Text>
            </Pressable>

            <Pressable style={styles.toggleButton} onPress={toggleMode}>
              <Text style={styles.toggleButtonText}>
                {mode === 'signin'
                  ? 'アカウントをお持ちでない方はこちら'
                  : '既にアカウントをお持ちの方はこちら'}
              </Text>
            </Pressable>
          </View>

          {/* 説明 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              匿名で利用する場合、データはこの端末にのみ保存されます。
            </Text>
            <Text style={styles.infoText}>
              メールアドレスで登録すると、複数の端末でデータを同期できます。
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  anonymousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  anonymousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
  },
  form: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    flex: 1,
  },
  authButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonDisabled: {
    backgroundColor: '#ccc',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  toggleButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
});
