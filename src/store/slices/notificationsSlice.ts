import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { apiFetch } from '@/lib/api';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  referenceType: string | null;
  referenceId: number | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const response = await apiFetch<AppNotification[]>('/notifications');
  return { items: response.data || [], unreadCount: response.meta?.unreadCount || 0 };
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id: string) => {
  const response = await apiFetch<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' });
  return response.data as AppNotification;
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async () => {
  await apiFetch('/notifications/read-all', { method: 'PATCH' });
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: { payload: AppNotification }) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    resetNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload.id);
        if (item && !item.isRead) {
          item.isRead = true;
          item.readAt = action.payload.readAt;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, resetNotifications } = notificationsSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadNotificationCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: RootState) => state.notifications.isLoading;

export default notificationsSlice.reducer;
