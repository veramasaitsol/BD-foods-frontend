import { apiFetch } from '@/lib/api';

export type BannerLinkType = 'product' | 'category' | 'url' | 'none';

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  buttonText: string | null;
  linkType: BannerLinkType;
  productId: string | null;
  categoryId: string | null;
  externalUrl: string | null;
  sortOrder: number;
}

export async function fetchLiveBanners(): Promise<Banner[]> {
  const response = await apiFetch<Banner[]>('/banners?live=true', { auth: false });
  return response.data || [];
}
