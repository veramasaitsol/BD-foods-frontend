import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddressId: null,
  isLoading: false,
  error: null,
};

export const fetchAddresses = createAsyncThunk('address/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await apiFetch<Address[]>('/addresses');
    return response.data || [];
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load addresses');
  }
});

export const createAddress = createAsyncThunk(
  'address/create',
  async (payload: Omit<Address, 'id'>, { rejectWithValue }) => {
    try {
      const response = await apiFetch<Address>('/addresses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response.data as Address;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add address');
    }
  }
);

export const updateAddressAsync = createAsyncThunk(
  'address/update',
  async (payload: Address, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const response = await apiFetch<Address>(`/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return response.data as Address;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update address');
    }
  }
);

export const deleteAddressAsync = createAsyncThunk(
  'address/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiFetch(`/addresses/${id}`, { method: 'DELETE' });
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete address');
    }
  }
);

export const setDefaultAddressAsync = createAsyncThunk(
  'address/setDefault',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiFetch<Address>(`/addresses/${id}/default`, { method: 'PATCH' });
      return response.data as Address;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to set default address');
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    selectAddress: (state, action: PayloadAction<string>) => {
      state.selectedAddressId = action.payload;
    },
    // Cleared on logout so a subsequent user (or guest) doesn't briefly see
    // the previous customer's saved addresses before a fresh fetch resolves.
    clearAddresses: (state) => {
      state.addresses = [];
      state.selectedAddressId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
        if (state.selectedAddressId === null) {
          const preferred = action.payload.find((a) => a.isDefault) || action.payload[0];
          state.selectedAddressId = preferred ? preferred.id : null;
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        if (action.payload.isDefault) {
          state.addresses.forEach((a) => {
            a.isDefault = false;
          });
        }
        state.addresses.push(action.payload);
        if (state.addresses.length === 1 || action.payload.isDefault) {
          state.selectedAddressId = action.payload.id;
        }
      })
      .addCase(updateAddressAsync.fulfilled, (state, action) => {
        if (action.payload.isDefault) {
          state.addresses.forEach((a) => {
            a.isDefault = a.id === action.payload.id;
          });
        }
        const index = state.addresses.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.addresses[index] = action.payload;
      })
      .addCase(deleteAddressAsync.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a.id !== action.payload);
        if (state.selectedAddressId === action.payload) {
          state.selectedAddressId = state.addresses[0]?.id ?? null;
        }
      })
      .addCase(setDefaultAddressAsync.fulfilled, (state, action) => {
        state.addresses.forEach((a) => {
          a.isDefault = a.id === action.payload.id;
        });
      });
  },
});

export const { selectAddress, clearAddresses } = addressSlice.actions;

export const selectAddresses = (state: { address: AddressState }) => state.address.addresses;
export const selectSelectedAddressId = (state: { address: AddressState }) => state.address.selectedAddressId;
export const selectSelectedAddress = (state: { address: AddressState }) =>
  state.address.addresses.find((a) => a.id === state.address.selectedAddressId);
export const selectAddressLoading = (state: { address: AddressState }) => state.address.isLoading;

export default addressSlice.reducer;
