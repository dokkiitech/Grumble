import { GrumbleItem } from '../services/grumble.service';
import { EventItem } from '../services/event.service';
import { UserResponse } from '../services/user.service';

// 現在のユーザーID（Mockモード用）
export const MOCK_CURRENT_USER_ID = 'mock-current-user';

// Mock投稿データ（DB設計に基づく）
export const mockGrumbles: GrumbleItem[] = [
  {
    grumble_id: '1',
    user_id: MOCK_CURRENT_USER_ID,
    content: '今日の会議、3時間も何の結論も出なかった...時間返して欲しい',
    toxic_level: 3,
    vibe_count: 42,
    is_purified: false,
    posted_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 23.5).toISOString(), // 23.5時間後
    is_event_grumble: false,
    has_vibed: false,
  },
  {
    grumble_id: '2',
    user_id: 'mock-user-2',
    content: '電車で隣の人、イヤホンから音漏れしまくり。しかも音楽のセンスが絶望的...',
    toxic_level: 2,
    vibe_count: 28,
    is_purified: false,
    posted_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1時間前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
    is_event_grumble: false,
    has_vibed: false,
  },
  {
    grumble_id: '3',
    user_id: 'mock-user-3',
    content: 'コンビニでレジ待ち10分。店員さん1人しかいないとか、人手不足どうにかして',
    toxic_level: 2,
    vibe_count: 15,
    is_purified: false,
    posted_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5時間前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 22.5).toISOString(),
    is_event_grumble: false,
    has_vibed: true,
  },
  {
    grumble_id: '4',
    user_id: MOCK_CURRENT_USER_ID,
    content: '上司の理不尽な指示。昨日と真逆のこと言ってるんだけど!?メモ取ってるのに意味ない',
    toxic_level: 4,
    vibe_count: 67,
    is_purified: false,
    posted_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2時間前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    is_event_grumble: false,
    has_vibed: false,
  },
  {
    grumble_id: '5',
    user_id: 'mock-user-5',
    content: 'Wi-Fiが遅すぎて仕事にならない。在宅勤務の意味ない',
    toxic_level: 3,
    vibe_count: 51,
    is_purified: true, // 成仏済み
    posted_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3時間前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 21).toISOString(),
    is_event_grumble: false,
    has_vibed: false,
  },
  {
    grumble_id: '6',
    user_id: 'mock-user-6',
    content: 'スーパーのレジで小銭を1枚ずつ数えてる人...後ろ並んでるんだけど',
    toxic_level: 1,
    vibe_count: 8,
    is_purified: false,
    posted_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4時間前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    is_event_grumble: false,
    has_vibed: false,
  },
  {
    grumble_id: '7',
    user_id: 'mock-user-7',
    content: 'プロジェクトのデッドラインが急に前倒し。計画性って言葉知ってる!?',
    toxic_level: 5,
    vibe_count: 89,
    is_purified: false,
    posted_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5時間前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 19).toISOString(),
    is_event_grumble: false,
    has_vibed: true,
  },
  {
    grumble_id: '8',
    user_id: 'mock-user-8',
    content: '夜中の2時に上司からLINE。緊急じゃないなら明日でいいでしょ',
    toxic_level: 4,
    vibe_count: 103,
    is_purified: false,
    posted_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6時間前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    is_event_grumble: false,
    has_vibed: false,
  },
  {
    grumble_id: '9',
    user_id: 'mock-user-9',
    content: 'エアコンの設定温度で毎日バトル。寒いんだって!',
    toxic_level: 2,
    vibe_count: 34,
    is_purified: false,
    posted_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(), // 7時間前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 17).toISOString(),
    is_event_grumble: false,
    has_vibed: false,
  },
  {
    grumble_id: '10',
    user_id: 'mock-user-10',
    content: '友達の自慢話が30分続いてる...いつ終わるの',
    toxic_level: 1,
    vibe_count: 12,
    is_purified: false,
    posted_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(), // 8時間前
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 16).toISOString(),
    is_event_grumble: false,
    has_vibed: false,
  },
];

// Mockイベントデータ（お焚き上げ）
export const mockEvents: EventItem[] = [
  {
    event_id: 1,
    event_name: '今夜のお焚き上げ',
    event_type: 'OTAKINAGE',
    start_time: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), // 今日の0時
    end_time: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(), // 今日の23:59
    current_hp: null,
    max_hp: null,
    is_active: true,
  },
];

// Mockユーザーデータ
export const mockUser: UserResponse = {
  user_id: MOCK_CURRENT_USER_ID,
  virtue_points: 42,
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30日前
  profile_title: '愚痴の聞き手',
};

// Mockデータのヘルパー関数
export const addMockGrumble = (content: string, toxicLevel: number): GrumbleItem => {
  const newGrumble: GrumbleItem = {
    grumble_id: `mock-${Date.now()}`,
    user_id: MOCK_CURRENT_USER_ID,
    content,
    toxic_level: toxicLevel,
    vibe_count: 0,
    is_purified: false,
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    is_event_grumble: false,
    has_vibed: false,
  };
  mockGrumbles.unshift(newGrumble);
  return newGrumble;
};

export const toggleMockVibe = (grumbleId: string): void => {
  const grumble = mockGrumbles.find((g) => g.grumble_id === grumbleId);
  if (grumble && !grumble.has_vibed) {
    grumble.has_vibed = true;
    grumble.vibe_count += 1;

    // 50以上で成仏
    if (grumble.vibe_count >= 50) {
      grumble.is_purified = true;
    }
  }
};
