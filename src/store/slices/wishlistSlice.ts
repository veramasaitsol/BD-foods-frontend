import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { apiFetch } from '@/lib/api';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  weight: string;
  originalPrice?: number;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}

const loadWishlistFromStorage = (): WishlistItem[] => {
  try {
    const stored = localStorage.getItem('brundhavanam_wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveWishlistToStorage = (items: WishlistItem[]) => {
  localStorage.setItem('brundhavanam_wishlist', JSON.stringify(items));
};

const initialState: WishlistState = {
  items: loadWishlistFromStorage(),
  isLoading: false,
};

interface ApiWishlistProduct {
  id: string;
  name: string;
  price: number;
  discountedPrice: number | null;
  weight: string | null;
  image: string | null;
}

function mapWishlistProduct(p: ApiWishlistProduct): WishlistItem {
  const hasDiscount = p.discountedPrice !== null && Number(p.discountedPrice) < Number(p.price);
  return {
    id: p.id,
    name: p.name,
    price: hasDiscount ? Number(p.discountedPrice) : Number(p.price),
    originalPrice: hasDiscount ? Number(p.price) : undefined,
    image: p.image || '',
    weight: p.weight || '',
  };
}

// Wishlist is server-backed for authenticated users and localStorage-backed
// for guests (so the public /wishlist route still works when logged out).
// Each thunk below checks auth state itself so call sites don't need to branch.

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { getState, rejectWithValue }) => {
  const state = getState() as RootState;
  if (!state.auth.isAuthenticated) return null;
  try {
    const response = await apiFetch<ApiWishlistProduct[]>('/wishlist');
    return (response.data || []).map(mapWishlistProduct);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load wishlist');
  }
});

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (item: WishlistItem, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (state.auth.isAuthenticated) {
      try {
        await apiFetch(`/wishlist/${item.id}`, { method: 'POST' });
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to wishlist');
      }
    }
    return item;
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (state.auth.isAuthenticated) {
      try {
        await apiFetch(`/wishlist/${id}`, { method: 'DELETE' });
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove from wishlist');
      }
    }
    return id;
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clear',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (state.auth.isAuthenticated) {
      try {
        await Promise.all(
          state.wishlist.items.map((item) => apiFetch(`/wishlist/${item.id}`, { method: 'DELETE' }))
        );
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear wishlist');
      }
    }
    return null;
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Discards any server-fetched wishlist state and falls back to whatever's
    // in localStorage, used on logout so a previous user's items don't linger.
    resetWishlistToLocal: (state) => {
      state.items = loadWishlistFromStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const exists = state.items.some((i) => i.id === action.payload.id);
        if (!exists) state.items.push(action.payload);
        saveWishlistToStorage(state.items);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
        saveWishlistToStorage(state.items);
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
        saveWishlistToStorage(state.items);
      });
  },
});

export const { resetWishlistToLocal } = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistCount = (state: RootState) => state.wishlist.items.length;
export const selectIsInWishlist = (id: string) => (state: RootState) =>
  state.wishlist.items.some((item) => item.id === id);

export default wishlistSlice.reducer;
