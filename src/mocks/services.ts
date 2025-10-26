import { GrumbleResponse, GrumbleItem, CreateGrumbleRequest } from '../services/grumble.service';
import { EventItem } from '../services/event.service';
import { UserResponse } from '../services/user.service';
import { mockGrumbles, mockEvents, mockUser, addMockGrumble, toggleMockVibe, MOCK_CURRENT_USER_ID } from './data';

// Mock Grumble Service
export const mockGrumbleService = {
  async getTimeline(params: {
    toxicLevelMin?: number;
    toxicLevelMax?: number;
    isPurified?: boolean;
    userId?: string; // 自分の投稿のみフィルター
    limit?: number;
    offset?: number;
  } = {}): Promise<GrumbleResponse> {
    // フィルタリングを適用
    let filteredGrumbles = [...mockGrumbles];

    // ユーザーIDでフィルター（自分の投稿のみ表示）
    if (params.userId !== undefined) {
      filteredGrumbles = filteredGrumbles.filter(
        (g) => g.user_id === params.userId
      );
    }

    if (params.toxicLevelMin !== undefined) {
      filteredGrumbles = filteredGrumbles.filter(
        (g) => g.toxic_level >= params.toxicLevelMin!
      );
    }

    if (params.toxicLevelMax !== undefined) {
      filteredGrumbles = filteredGrumbles.filter(
        (g) => g.toxic_level <= params.toxicLevelMax!
      );
    }

    if (params.isPurified !== undefined) {
      filteredGrumbles = filteredGrumbles.filter(
        (g) => g.is_purified === params.isPurified
      );
    }

    // ページネーション
    const offset = params.offset || 0;
    const limit = params.limit || 20;
    const paginatedGrumbles = filteredGrumbles.slice(offset, offset + limit);

    // 模擬的な遅延
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      grumbles: paginatedGrumbles,
      total: filteredGrumbles.length,
      limit,
      offset,
    };
  },

  async createGrumble(request: CreateGrumbleRequest): Promise<GrumbleItem> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return addMockGrumble(request.content, request.toxic_level);
  },

  async sendVibe(grumbleId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    toggleMockVibe(grumbleId);
  },
};

// Mock Event Service
export const mockEventService = {
  async getActiveEvents(): Promise<EventItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockEvents.filter((event) => event.is_active);
  },
};

// Mock User Service
export const mockUserService = {
  async getMyProfile(): Promise<UserResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockUser;
  },
};
