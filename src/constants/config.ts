// API設定
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8080/api/v1'
  : 'https://api.grumble.app/v1';

// WebSocket設定
export const WS_BASE_URL = __DEV__
  ? 'ws://localhost:8080/ws'
  : 'wss://api.grumble.app/ws';

// アプリ設定
export const MAX_GRUMBLE_LENGTH = 280;
export const PURIFICATION_THRESHOLD = 50; // 成仏に必要な「わかる…」数
export const TOXIC_LEVELS = [1, 2, 3, 4, 5] as const;
export const TOXIC_LEVEL_LABELS = {
  1: 'ちょっとモヤモヤ',
  2: 'イライラする',
  3: 'かなりムカつく',
  4: '激おこ',
  5: '大爆発寸前',
} as const;
