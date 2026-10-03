import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { getToken } from '@/lib/tokenStorage';
import { apiFetch } from '@/lib/api';
import { requestFcmToken, listenForForegroundMessages } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { fetchOrders } from '@/store/slices/orderSlice';
import { addNotification, fetchNotifications, AppNotification } from '@/store/slices/notificationsSlice';

interface LiveOrder {
  orderNumber: string;
  status: string;
}

export function useLiveUpdates() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Connect regardless of login state — product/category/banner/settings
    // updates are public and should reach guests browsing the storefront too.
    // Passing the token (when present) lets the server also join this socket
    // to the customer's own room for order-status pushes.
    const socket = connectSocket(getToken());

    if (isAuthenticated) {
      dispatch(fetchNotifications());

      requestFcmToken()
        .then((fcmToken) => {
          if (fcmToken) {
            return apiFetch('/user/fcm-token', { method: 'PATCH', body: JSON.stringify({ fcmToken }) });
          }
        })
        .catch((err) => console.warn('[push] FCM token registration failed:', err));

      listenForForegroundMessages(({ title, body }) => {
        toast({ title: title || 'New notification', description: body });
      });
    }

    socket.on('order:updated', (order: LiveOrder) => {
      toast({
        title: `Order ${order.orderNumber} updated`,
        description: `Status: ${order.status}`,
      });
      dispatch(fetchOrders());
    });

    socket.on('notification:new', (notification: AppNotification) => {
      dispatch(addNotification(notification));
      toast({ title: notification.title, description: notification.message });
    });

    socket.on('products:changed', () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    });
    socket.on('categories:changed', () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    });
    socket.on('banners:changed', () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    });
    socket.on('settings:changed', () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    });

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, dispatch, queryClient]);
}
