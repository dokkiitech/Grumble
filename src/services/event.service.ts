import api from './api';
import { paths } from '../types/api';
import { mockEventService } from '../mocks/services';

type EventsResponse = paths['/events']['get']['responses']['200']['content']['application/json'];
type EventResponse = paths['/events/{event_id}']['get']['responses']['200']['content']['application/json'];
type EventItem = EventsResponse['events'][number];

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

class EventService {
  /**
   * イベント一覧取得
   */
  async getEvents(activeOnly: boolean = true): Promise<EventsResponse> {
    if (USE_MOCK_API) {
      const events = await mockEventService.getActiveEvents();
      return {
        events,
        total: events.length,
      };
    }

    const response = await api.get<EventsResponse>('/events', {
      params: { active_only: activeOnly },
    });
    return response.data;
  }

  /**
   * イベント詳細取得
   */
  async getEvent(eventId: number): Promise<EventResponse> {
    if (USE_MOCK_API) {
      const events = await mockEventService.getActiveEvents();
      const event = events.find((e) => e.event_id === eventId);
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }
      return event;
    }

    const response = await api.get<EventResponse>(`/events/${eventId}`);
    return response.data;
  }
}

export const eventService = new EventService();
export type { EventItem };
