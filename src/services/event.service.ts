import { mockEventService } from '../mocks/services';
import { paths } from '../types/api';
import api from './api';
import { GrumbleItem } from './grumble.service';

// __DEV__ はグローバル変数なので、型定義が必要な場合のみ
declare const __DEV__: boolean;

type EventsResponse = paths['/events']['get']['responses']['200']['content']['application/json'];
type EventResponse = paths['/events/{event_id}']['get']['responses']['200']['content']['application/json'];
type EventItem = NonNullable<EventsResponse['events']>[number];

export interface EventGrumblesResponse {
  grumbles: GrumbleItem[];
  total: number;
  is_event_active: boolean;
  event_date: string;
}

export interface EventGrumblesParams {
  toxic_level_min?: number;
  toxic_level_max?: number;
  limit?: number;
  offset?: number;
}

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

class EventService {
  /**
   * イベント一覧取得
   */
  async getEvents(activeOnly: boolean = true): Promise<EventsResponse> {
    if (USE_MOCK_API) {
      const events = await mockEventService.getActiveEvents();
      return {
        events,
        total: events.length,
      };
    }

    const response = await api.get<EventsResponse>('/events', {
      params: { active_only: activeOnly },
    });
    return response.data;
  }

  /**
   * イベント詳細取得
   */
  async getEvent(eventId: number): Promise<EventResponse> {
    if (USE_MOCK_API) {
      const events = await mockEventService.getActiveEvents();
      const event = events.find((e) => e.event_id === eventId);
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }
      return event;
    }

    const response = await api.get<EventResponse>(`/events/${eventId}`);
    return response.data;
  }

  /**
   * イベント用投稿取得（前日の投稿）
   */
  async getEventGrumbles(params: EventGrumblesParams = {}, userId?: string): Promise<EventGrumblesResponse> {
    // ============================================
    // 【モック実装】本番環境では削除
    // ============================================
    // 開発環境でのUI確認用のモックデータ
    // バックエンドと連携する際は、以下の if ブロック全体を削除
    // ============================================
    if (USE_MOCK_API || (typeof __DEV__ !== 'undefined' && __DEV__)) {
      // 開発環境では、otakinage.tsxと同じモックデータを返す
      if (userId) {
        const mockGrumbles: GrumbleItem[] = [
          {
            grumble_id: 'mock-1',
            user_id: userId,
            content: 'MacBook Pro 高すぎ！',
            toxic_level: 5,
            vibe_count: 12,
            is_purified: false,
            posted_at: new Date().toISOString(),
            expires_at: new Date().toISOString(),
            is_event_grumble: false,
            has_vibed: false,
          },
          {
            grumble_id: 'mock-2',
            user_id: userId,
            content: 'シフト削られたー...',
            toxic_level: 2,
            vibe_count: 4,
            is_purified: false,
            posted_at: new Date().toISOString(),
            expires_at: new Date().toISOString(),
            is_event_grumble: false,
            has_vibed: false,
          },
        ];
        return {
          grumbles: mockGrumbles,
          total: mockGrumbles.length,
          is_event_active: true,
          event_date: new Date().toISOString().split('T')[0],
        };
      }
      return {
        grumbles: [],
        total: 0,
        is_event_active: false,
        event_date: '',
      };
    }
    // ============================================
    // 【モックここまで】
    // ============================================

    // 本番環境では以下のコードが実行される
    const response = await api.get<EventGrumblesResponse>('/events/grumbles', {
      params,
    });
    return response.data;
  }
}

export const eventService = new EventService();
export type { EventItem };
