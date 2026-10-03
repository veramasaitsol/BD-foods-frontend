import { apiFetch } from '@/lib/api';

export interface StoreSettings {
  storeName: string;
  storeEmail: string | null;
  storePhone: string | null;
  storePhone2: string | null;
  storeWebsite: string | null;
  storeAddress: string | null;
  aboutContent: string | null;
  contactMessage: string | null;
  termsContent: string | null;
  privacyContent: string | null;
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const response = await apiFetch<StoreSettings>('/settings', { auth: false });
  return response.data as StoreSettings;
}
