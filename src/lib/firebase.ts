import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBnmbjh2yxhJ1Kxovh92cWRYfPcXg8_ugA',
  authDomain: 'brundhavanam-desi-foods.firebaseapp.com',
  projectId: 'brundhavanam-desi-foods',
  storageBucket: 'brundhavanam-desi-foods.firebasestorage.app',
  messagingSenderId: '292902930263',
  appId: '1:292902930263:web:0328f3a848c08082d1e012',
  measurementId: 'G-XLDK9E66L5',
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

const app = initializeApp(firebaseConfig);

// Initialize Analytics
let analyticsPromise: Promise<Analytics | null> | null = null;

function getAnalyticsIfSupported(): Promise<Analytics | null> {
  if (!analyticsPromise) {
    analyticsPromise = isAnalyticsSupported().then((ok) => (ok ? getAnalytics(app) : null));
  }
  return analyticsPromise;
}

// Initialize on module load
getAnalyticsIfSupported().then((a) => {
  if (a) console.log('[analytics] Firebase Analytics initialized');
});

let messagingPromise: Promise<Messaging | null> | null = null;

function getMessagingIfSupported(): Promise<Messaging | null> {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((ok) => (ok ? getMessaging(app) : null));
  }
  return messagingPromise;
}

// Returns null if the browser doesn't support push, permission is denied,
// or VITE_FIREBASE_VAPID_KEY isn't configured — callers should treat push
// registration as a best-effort enhancement, not a required step.
export async function requestFcmToken(): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn('[push] VITE_FIREBASE_VAPID_KEY not set — push notifications disabled.');
    return null;
  }

  const messaging = await getMessagingIfSupported();
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  try {
    return await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
  } catch (err) {
    console.warn('[push] Failed to fetch FCM token:', err);
    return null;
  }
}

export async function listenForForegroundMessages(
  callback: (payload: { title?: string; body?: string }) => void
) {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    callback({ title: payload.notification?.title, body: payload.notification?.body });
  });
}

// Analytics helper — call this to log custom events
export async function logAnalyticsEvent(eventName: string, params?: Record<string, string | number>) {
  const analytics = await getAnalyticsIfSupported();
  if (analytics) {
    const { logEvent } = await import('firebase/analytics');
    logEvent(analytics, eventName, params);
  }
}
