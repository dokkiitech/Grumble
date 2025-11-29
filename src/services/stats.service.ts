import api, { apiClient } from './api';
import { authService } from './auth.service';

export type Granularity = 'day' | 'week' | 'month';

export interface StatsParams {
  granularity: Granularity;
  from?: string; // ISO8601 UTC
  to?: string;   // ISO8601 UTC (非含む)
  tz?: string;   // 例: "Asia/Tokyo"
}

export interface GrumbleStatsBucket {
  bucket: string; // date-time (UTC) バケット開始
  purified_count: number;
  unpurified_count: number;
  total_vibes: number;
}

export interface GrumbleStatsToxicBucket extends GrumbleStatsBucket {
  toxic_level: number;
}

class StatsService {
  /**
   * /stats/grumbles にリクエストして集計値を取得
   */
  async getGrumbleStats(params: StatsParams): Promise<GrumbleStatsBucket[]> {
    // 毎回最新のトークンを付与して401を防ぐ
    const token = await authService.getIdToken(true);
    if (!token) {
      throw new Error('Not authenticated');
    }
    apiClient.setAuthToken(token);

    const response = await api.get<GrumbleStatsBucket[]>('/stats/grumbles', {
      params,
    });
    return response.data;
  }

  /**
   * /stats/grumbles/toxic にリクエストして毒度別集計値を取得
   */
  async getGrumbleStatsToxic(params: StatsParams & { toxic_level?: number }): Promise<GrumbleStatsToxicBucket[]> {
    const token = await authService.getIdToken(true);
    if (!token) {
      throw new Error('Not authenticated');
    }
    apiClient.setAuthToken(token);

    const response = await api.get<GrumbleStatsToxicBucket[]>('/stats/grumbles/toxic', {
      params,
    });
    return response.data;
  }
}

export const statsService = new StatsService();
