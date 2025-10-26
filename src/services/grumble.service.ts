import api from './api';
import { paths } from '../types/api';
import { mockGrumbleService } from '../mocks/services';

type GrumbleResponse = paths['/grumbles']['get']['responses']['200']['content']['application/json'];
type GrumbleItem = GrumbleResponse['grumbles'][number];
type CreateGrumbleRequest = paths['/grumbles']['post']['requestBody']['content']['application/json'];
type CreateGrumbleResponse = paths['/grumbles']['post']['responses']['201']['content']['application/json'];

export interface TimelineParams {
  toxic_level_min?: number;
  toxic_level_max?: number;
  unpurified_only?: boolean;
  limit?: number;
  offset?: number;
}

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

class GrumbleService {
  /**
   * タイムライン取得
   */
  async getTimeline(params: TimelineParams = {}): Promise<GrumbleResponse> {
    if (USE_MOCK_API) {
      return mockGrumbleService.getTimeline({
        toxicLevelMin: params.toxic_level_min,
        toxicLevelMax: params.toxic_level_max,
        isPurified: params.unpurified_only === true ? false : undefined,
        limit: params.limit,
        offset: params.offset,
      });
    }

    const response = await api.get<GrumbleResponse>('/grumbles', { params });
    return response.data;
  }

  /**
   * 投稿作成
   */
  async createGrumble(data: CreateGrumbleRequest): Promise<CreateGrumbleResponse> {
    if (USE_MOCK_API) {
      return mockGrumbleService.createGrumble(data);
    }

    const response = await api.post<CreateGrumbleResponse>('/grumbles', data);
    return response.data;
  }

  /**
   * 「わかる…」を送る
   */
  async addVibe(grumbleId: string): Promise<void> {
    if (USE_MOCK_API) {
      await mockGrumbleService.sendVibe(grumbleId);
      return;
    }

    await api.post(`/grumbles/${grumbleId}/vibes`, {
      vibe_type: 'WAKARU',
    });
  }
}

export const grumbleService = new GrumbleService();
export type { GrumbleItem, GrumbleResponse, CreateGrumbleRequest };
