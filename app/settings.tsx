import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/stores/userStore';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const router = useRouter();
  const { firebaseUser, user, logout } = useUserStore();

  const isAnonymous = firebaseUser?.isAnonymous ?? false;

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleUpgradeAccount = () => {
    router.push('/upgrade-account');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>設定</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* アカウント情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ログイン状態</Text>
              <Text style={styles.infoValue}>
                {isAnonymous ? '匿名ユーザー' : 'メールアカウント'}
              </Text>
            </View>

            {!isAnonymous && firebaseUser?.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>メールアドレス</Text>
                <Text style={styles.infoValue}>{firebaseUser.email}</Text>
              </View>
            )}

            {user && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>徳ポイント</Text>
                  <Text style={styles.infoValue}>{user.virtue_points} pt</Text>
                </View>

                {user.profile_title && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>称号</Text>
                    <Text style={styles.infoValue}>{user.profile_title}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* アクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アクション</Text>

          {isAnonymous && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleUpgradeAccount}
            >
              <IconSymbol name="person.badge.plus" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>
                アカウント登録（データ引き継ぎ）
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
            <Text style={styles.dangerButtonText}>ログアウト</Text>
          </TouchableOpacity>
        </View>

        {/* アプリ情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリ情報</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>バージョン</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>API モード</Text>
              <Text style={styles.infoValue}>
                {process.env.EXPO_PUBLIC_USE_MOCK_API === 'true' ? 'Mock' : 'Real'}
              </Text>
            </View>
          </View>
        </View>

        {isAnonymous && (
          <View style={styles.warningCard}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#FF9500" />
            <Text style={styles.warningText}>
              匿名ユーザーはアプリを削除するとデータが失われます。
              アカウント登録してデータを保護しましょう。
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
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
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  dangerButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE6B3',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#996600',
    lineHeight: 20,
  },
});
