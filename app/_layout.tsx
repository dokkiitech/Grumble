import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import 'react-native-get-random-values';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/src/stores/userStore';
import { useWebSocket } from '@/src/hooks/useWebSocket';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppFonts } from '@/constants/theme';

// スプラッシュスクリーンの自動非表示を防ぐ
SplashScreen.preventAutoHideAsync();

// デフォルトのフォントを設定
const defaultTextProps = Text.defaultProps || {};
defaultTextProps.style = [defaultTextProps.style, { fontFamily: AppFonts.regular }];
Text.defaultProps = defaultTextProps;

const defaultTextInputProps = TextInput.defaultProps || {};
defaultTextInputProps.style = [defaultTextInputProps.style, { fontFamily: AppFonts.regular }];
TextInput.defaultProps = defaultTextInputProps;

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useUserStore();

  useWebSocket(); // WebSocketフックを追加

  // 認証状態に基づいてナビゲーションを制御
  useEffect(() => {
    // ローディング中やナビゲーションの準備ができていない場合は何もしない
    if (isLoading || !router) return;

    const inAuthGroup = segments[0] === 'auth';

    // タイムアウトを使用してナビゲーションが完全にマウントされるのを待つ
    const timeout = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        // 未認証で認証画面にいない場合、認証画面にリダイレクト
        router.replace('/auth');
      } else if (isAuthenticated && inAuthGroup) {
        // 認証済みで認証画面にいる場合、タブ画面にリダイレクト
        router.replace('/(tabs)');
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="create-grumble"
          options={{
            presentation: 'modal',
            title: '愚痴を吐き出す',
            headerShown: true
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const initializeAuth = useUserStore((state) => state.initializeAuth);

  const [fontsLoaded, fontError] = useFonts({
    'KaiseiDecol-Regular': require('../assets/fonts/KaiseiDecol-Regular.ttf'),
    'KaiseiDecol-Medium': require('../assets/fonts/KaiseiDecol-Medium.ttf'),
    'KaiseiDecol-Bold': require('../assets/fonts/KaiseiDecol-Bold.ttf'),
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
