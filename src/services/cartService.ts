// Plain helpers (not Redux thunks) used only to sync the local cart to the
// server cart at checkout time. The cart itself stays localStorage-first
// (see cartSlice.ts) — these are called directly from OrderReview.tsx.
import { apiFetch } from '@/lib/api';

export async function clearServerCart(): Promise<void> {
  await apiFetch('/cart', { method: 'DELETE' });
}

export async function addServerCartItem(productId: string, quantity: number): Promise<void> {
  await apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}
