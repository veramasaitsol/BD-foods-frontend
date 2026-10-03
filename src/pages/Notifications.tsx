import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectNotifications,
  selectUnreadNotificationCount,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/store/slices/notificationsSlice';

const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Notifications - Brundhavanam Desi Foods</title>
        <meta name="description" content="Your notifications - Brundhavanam Desi Foods" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="py-8 md:py-12">
          <div className="container mx-auto px-4 ">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => dispatch(markAllNotificationsRead())}>
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </Button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <Bell className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  No notifications yet
                </h2>
                <p className="text-muted-foreground">
                  We'll let you know when there's something new.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (!notification.isRead) dispatch(markNotificationRead(notification.id));
                    }}
                    className={`w-full text-left p-4 rounded-xl shadow-soft transition-colors ${
                      notification.isRead ? 'bg-card' : 'bg-primary/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.isRead && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      <div className={notification.isRead ? 'ml-5' : ''}>
                        <p className={`text-foreground ${notification.isRead ? 'font-medium' : 'font-bold'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Notifications;
