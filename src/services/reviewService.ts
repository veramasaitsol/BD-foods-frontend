import { apiFetch } from '@/lib/api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  customer: { id: string; name: string } | null;
  orderId: string | null;
  rating: number;
  comment: string | null;
  status: 'approved' | 'hidden';
  createdAt: string;
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const response = await apiFetch<Review[]>(`/reviews?productId=${productId}`, { auth: false });
  return response.data || [];
}

export async function submitReview(input: {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const response = await apiFetch<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data as Review;
}
