import { apiFetch } from '@/lib/api';

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  thumbnailUrl: string | null;
  sortOrder: number;
}

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const response = await apiFetch<GalleryItem[]>('/gallery?live=true', { auth: false });
  return response.data || [];
}
