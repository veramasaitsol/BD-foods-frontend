import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  weight?: string;
  variantLabel?: string;
}

interface CartState {
  items: CartItem[];
}

const storedCart = localStorage.getItem('brundhavanam_cart');

const initialState: CartState = {
  items: storedCart ? JSON.parse(storedCart) : [],
};

const saveToLocalStorage = (items: CartItem[]) => {
  localStorage.setItem('brundhavanam_cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItem = state.items.find(
        i => i.id === action.payload.id && i.variantLabel === action.payload.variantLabel
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      saveToLocalStorage(state.items);
    },
    removeItem: (state, action: PayloadAction<{ id: string; variantLabel?: string }>) => {
      state.items = state.items.filter(
        i => !(i.id === action.payload.id && i.variantLabel === action.payload.variantLabel)
      );
      saveToLocalStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number; variantLabel?: string }>
    ) => {
      const { id, quantity, variantLabel } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(i => !(i.id === id && i.variantLabel === variantLabel));
      } else {
        const item = state.items.find(i => i.id === id && i.variantLabel === variantLabel);
        if (item) {
          item.quantity = quantity;
        }
      }
      saveToLocalStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveToLocalStorage(state.items);
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectTotalItems = (state: { cart: CartState }) => 
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectTotalPrice = (state: { cart: CartState }) => 
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default cartSlice.reducer;
