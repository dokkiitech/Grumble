import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../constants/config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // レスポンスインターセプター（エラーハンドリング）
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // ネットワークエラーの場合（バックエンドが起動していない場合）
        if (error.message === 'Network Error') {
          console.log('Backend API not available');
        } else {
          console.error('API Error:', error.response?.data || error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.client;
  }

  // Firebase ID Tokenをヘッダーに設定
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // 認証トークンを削除
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // ユーザーIDをヘッダーに設定（後方互換性のため残す）
  setUserId(userId: string) {
    this.client.defaults.headers.common['X-User-ID'] = userId;
  }
}

export const apiClient = new ApiClient();
export default apiClient.getInstance();
