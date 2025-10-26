import { create } from 'zustand';
import { User } from 'firebase/auth';
import { userService, UserResponse } from '../services/user.service';
import { authService } from '../services/auth.service';
import { apiClient } from '../services/api';

interface UserState {
  // Firebase User
  firebaseUser: User | null;
  // バックエンドのユーザー情報
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initializeAuth: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setFirebaseUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  firebaseUser: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  setFirebaseUser: (firebaseUser: User | null) => {
    set({ firebaseUser, isAuthenticated: !!firebaseUser });
  },

  initializeAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      // Firebase認証状態を監視
      authService.onAuthStateChanged(async (firebaseUser) => {
        set({ firebaseUser, isAuthenticated: !!firebaseUser });

        if (firebaseUser) {
          // Firebase ID Tokenを取得してAPIクライアントに設定
          const idToken = await authService.getIdToken();
          if (idToken) {
            apiClient.setAuthToken(idToken);
          }

          // バックエンドからユーザー情報を取得（バックエンドが無い場合はスキップ）
          try {
            const user = await userService.getMyProfile();
            set({ user, isLoading: false });
          } catch (error) {
            console.log('Backend API not available, continuing without user profile');
            set({ user: null, isLoading: false });
          }
        } else {
          set({ user: null, isLoading: false });
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ error: '認証の初期化に失敗しました', isLoading: false });
    }
  },

  signInAnonymously: async () => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await authService.signInAnonymously();

      // Firebase ID Tokenを取得してAPIクライアントに設定
      const idToken = await authService.getIdToken();
      if (idToken) {
        apiClient.setAuthToken(idToken);
      }

      // バックエンドからユーザー情報を取得（バックエンドが無い場合はスキップ）
      let user = null;
      try {
        user = await userService.getMyProfile();
      } catch (apiError) {
        console.log('Backend API not available, continuing without user profile');
      }

      set({
        firebaseUser,
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = authService.getErrorMessage(error);
      console.error('Anonymous sign in failed:', error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await authService.signInWithEmail(email, password);

      // Firebase ID Tokenを取得してAPIクライアントに設定
      const idToken = await authService.getIdToken();
      if (idToken) {
        apiClient.setAuthToken(idToken);
      }

      // バックエンドからユーザー情報を取得（バックエンドが無い場合はスキップ）
      let user = null;
      try {
        user = await userService.getMyProfile();
      } catch (apiError) {
        console.log('Backend API not available, continuing without user profile');
      }

      set({
        firebaseUser,
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = authService.getErrorMessage(error);
      console.error('Email sign in failed:', error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signUpWithEmail: async (email: string, password: string, displayName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await authService.signUpWithEmail(email, password, displayName);

      // Firebase ID Tokenを取得してAPIクライアントに設定
      const idToken = await authService.getIdToken();
      if (idToken) {
        apiClient.setAuthToken(idToken);
      }

      // バックエンドからユーザー情報を取得（バックエンドが無い場合はスキップ）
      let user = null;
      try {
        user = await userService.getMyProfile();
      } catch (apiError) {
        console.log('Backend API not available, continuing without user profile');
      }

      set({
        firebaseUser,
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = authService.getErrorMessage(error);
      console.error('Email sign up failed:', error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.getMyProfile();
      set({ user, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({ error: 'ユーザー情報の取得に失敗しました', isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authService.signOut();
      set({
        firebaseUser: null,
        user: null,
        isAuthenticated: false,
        error: null
      });
    } catch (error) {
      console.error('Logout failed:', error);
      set({ error: 'ログアウトに失敗しました' });
    }
  },
}));
