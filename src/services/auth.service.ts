import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  onAuthStateChanged,
  AuthError,
} from 'firebase/auth';
import { auth } from '../config/firebase';

class AuthService {
  /**
   * 匿名ログイン
   */
  async signInAnonymously(): Promise<User> {
    try {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    } catch (error) {
      console.error('Anonymous sign in failed:', error);
      throw error;
    }
  }

  /**
   * メールアドレスとパスワードでログイン
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Email sign in failed:', error);
      throw error;
    }
  }

  /**
   * メールアドレスとパスワードで新規登録
   */
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 表示名を設定
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return userCredential.user;
    } catch (error) {
      console.error('Email sign up failed:', error);
      throw error;
    }
  }

  /**
   * ログアウト
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  /**
   * パスワードリセットメール送信
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset email failed:', error);
      throw error;
    }
  }

  /**
   * 現在のユーザーを取得
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Firebase ID Tokenを取得
   */
  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      const token = await user.getIdToken(forceRefresh);
      return token;
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  }

  /**
   * 認証状態の変更を監視
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * エラーメッセージを日本語化
   */
  getErrorMessage(error: AuthError): string {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'メールアドレスの形式が正しくありません';
      case 'auth/user-disabled':
        return 'このアカウントは無効化されています';
      case 'auth/user-not-found':
        return 'ユーザーが見つかりません';
      case 'auth/wrong-password':
        return 'パスワードが間違っています';
      case 'auth/email-already-in-use':
        return 'このメールアドレスは既に使用されています';
      case 'auth/weak-password':
        return 'パスワードは6文字以上である必要があります';
      case 'auth/network-request-failed':
        return 'ネットワークエラーが発生しました';
      case 'auth/too-many-requests':
        return 'リクエストが多すぎます。しばらく待ってから再試行してください';
      default:
        return '認証エラーが発生しました';
    }
  }
}

export const authService = new AuthService();
