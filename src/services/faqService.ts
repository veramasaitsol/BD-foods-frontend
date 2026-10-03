import { apiFetch } from '@/lib/api';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export async function fetchFaqs(): Promise<Faq[]> {
  const response = await apiFetch<Faq[]>('/faqs?live=true', { auth: false });
  return response.data || [];
}
