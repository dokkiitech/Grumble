import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { websocketService } from '../services/websocket.service';
import { useUserStore } from '../stores/userStore';

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useUserStore();

  useEffect(() => {
    // 認証が完了してユーザー情報が取得できるまで待つ
    if (!isAuthenticated || !user?.user_id) return;

    // WebSocket接続
    websocketService.connect(user.user_id);

    // 投稿更新イベント
    const handleGrumbleUpdate = (data: any) => {
      console.log('Grumble updated:', data);
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    };

    // 「わかる…」更新イベント
    const handleVibeUpdate = (data: any) => {
      console.log('Vibe updated:', data);
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    };

    // 成仏イベント
    const handlePurification = (data: any) => {
      console.log('Grumble purified:', data);
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      // TODO: 成仏アニメーション表示
    };

    // イベント更新
    const handleEventUpdate = (data: any) => {
      console.log('Event updated:', data);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    };

    // リスナー登録
    websocketService.on('grumble_update', handleGrumbleUpdate);
    websocketService.on('vibe_update', handleVibeUpdate);
    websocketService.on('purification', handlePurification);
    websocketService.on('event_update', handleEventUpdate);

    // クリーンアップ
    return () => {
      websocketService.off('grumble_update', handleGrumbleUpdate);
      websocketService.off('vibe_update', handleVibeUpdate);
      websocketService.off('purification', handlePurification);
      websocketService.off('event_update', handleEventUpdate);
      websocketService.disconnect();
    };
  }, [user?.user_id, queryClient]);
};
