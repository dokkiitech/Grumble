import api from './api';
import { paths } from '../types/api';
import { mockUserService } from '../mocks/services';

type UserResponse = paths['/users/me']['get']['responses']['200']['content']['application/json'];

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

class UserService {
  /**
   * 自分のユーザー情報取得
   */
  async getMyProfile(): Promise<UserResponse> {
    if (USE_MOCK_API) {
      return mockUserService.getMyProfile();
    }

    const response = await api.get<UserResponse>('/users/me');
    return response.data;
  }
}

export const userService = new UserService();
export type { UserResponse };
