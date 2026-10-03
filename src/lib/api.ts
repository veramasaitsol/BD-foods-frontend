// Generic fetch wrapper for the Brundhavanam Desi Foods backend REST API.
import { getToken } from '@/lib/tokenStorage';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount?: number;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: ApiMeta;
  errors?: unknown;
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | null;
  /** Attach `Authorization: Bearer <token>` when a token is present. Defaults to true. */
  auth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<ApiEnvelope<T>> {
  const { auth = true, headers, body, ...rest } = options;

  const finalHeaders = new Headers(headers);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body,
  });

  const json: ApiEnvelope<T> = await response.json().catch(() => ({
    success: false,
    message: 'Invalid response from server',
  }));

  if (!response.ok || json.success === false) {
    throw new Error(json.message || 'Request failed');
  }

  return json;
}
