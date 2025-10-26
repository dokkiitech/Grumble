import { WS_BASE_URL } from '../constants/config';

type WebSocketEventType = 'grumble_update' | 'vibe_update' | 'purification' | 'event_update';

interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
}

type EventCallback = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<WebSocketEventType, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private userId: string | null = null;

  connect(userId: string) {
    this.userId = userId;

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.ws = new WebSocket(`${WS_BASE_URL}?user_id=${userId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.log('WebSocket error (backend may not be available):', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected (backend may not be available)');
        // バックエンドが無い場合は再接続を試みない
        // this.attemptReconnect();
      };
    } catch (error) {
      console.log('Failed to connect WebSocket (backend may not be available)');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  on(event: WebSocketEventType, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: WebSocketEventType, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach((callback) => callback(message.data));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }
}

export const websocketService = new WebSocketService();
