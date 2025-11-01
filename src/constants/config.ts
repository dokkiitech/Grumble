// API設定
// .env で指定したAPIサーバーのベースURLを使用
// モックモード時はダミーURLでも問題ない（実際には接続しないため）
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// WebSocket設定
// .env で指定したWebSocketサーバーのベースURLを使用
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL || 'ws://localhost:8080/ws';

// アプリ設定
export const MAX_GRUMBLE_LENGTH = 280;
export const PURIFICATION_THRESHOLD = 2; // 成仏に必要な「わかる…」数
export const TOXIC_LEVELS = [1, 2, 3, 4, 5] as const;
export const TOXIC_LEVEL_LABELS = {
  1: 'ちょっとモヤモヤ',
  2: 'イライラする',
  3: 'かなりムカつく',
  4: '激おこ',
  5: '大爆発寸前',
} as const;
