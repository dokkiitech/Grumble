import api from './api';

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

class StatsService {
  /**
   * /stats/grumbles にリクエストして集計値を取得
   */
  async getGrumbleStats(params: StatsParams): Promise<GrumbleStatsBucket[]> {
    const response = await api.get<GrumbleStatsBucket[]>('/stats/grumbles', {
      params,
    });
    return response.data;
  }
}

export const statsService = new StatsService();
