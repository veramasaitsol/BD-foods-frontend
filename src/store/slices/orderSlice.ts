import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

export type PaymentMethod = 'cod' | 'upi' | 'card';

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  price: number;
  weight: string | null;
  quantity: number;
  image: string | null;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface DeliveryPartnerSummary {
  id: string;
  name: string;
  phone: string | null;
  vehicleType: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode: string | null;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  status: 'placed' | 'assigned' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryPartnerId: string | null;
  deliveryPartner: DeliveryPartnerSummary | null;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  currentPaymentMethod: PaymentMethod;
  isLoading: boolean;
  isPlacingOrder: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentPaymentMethod: 'cod',
  isLoading: false,
  isPlacingOrder: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('order/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await apiFetch<Order[]>('/orders');
    return response.data || [];
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load orders');
  }
});

export const placeOrderAsync = createAsyncThunk(
  'order/place',
  async (
    payload: { addressId: string; paymentMethod: PaymentMethod; couponCode?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response.data as Order;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to place order');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.currentPaymentMethod = action.payload;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(placeOrderAsync.pending, (state) => {
        state.isPlacingOrder = true;
        state.error = null;
      })
      .addCase(placeOrderAsync.fulfilled, (state, action) => {
        state.isPlacingOrder = false;
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrderAsync.rejected, (state, action) => {
        state.isPlacingOrder = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPaymentMethod, clearOrders } = orderSlice.actions;

export const selectOrders = (state: { order: OrderState }) => state.order.orders;
export const selectOrdersLoading = (state: { order: OrderState }) => state.order.isLoading;
export const selectCurrentPaymentMethod = (state: { order: OrderState }) => state.order.currentPaymentMethod;
export const selectIsPlacingOrder = (state: { order: OrderState }) => state.order.isPlacingOrder;

export default orderSlice.reducer;
