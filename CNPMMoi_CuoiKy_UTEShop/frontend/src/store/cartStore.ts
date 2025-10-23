import { create } from 'zustand';
import { Cart } from '@/types/cart.types';
import { cartService } from '@/services/cart.service';

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  
  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItemCount: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartService.getCart();
      if (response.success) {
        set({ cart: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId: number, quantity: number) => {
    set({ isLoading: true });
    try {
      const response = await cartService.addToCart({ product_id: productId, quantity });
      if (response.success) {
        // Refresh cart after adding
        await get().fetchCart();
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    set({ isLoading: true });
    try {
      const response = await cartService.updateCartItem(itemId, { quantity });
      if (response.success) {
        // Refresh cart after updating
        await get().fetchCart();
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeCartItem: async (itemId: number) => {
    set({ isLoading: true });
    try {
      const response = await cartService.removeCartItem(itemId);
      if (response.success) {
        // Refresh cart after removing
        await get().fetchCart();
      }
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        set({ cart: null });
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getCartItemCount: () => {
    const { cart } = get();
    return cart?.summary.total_items || 0;
  },

  getTotalAmount: () => {
    const { cart } = get();
    return cart?.summary.total_amount || 0;
  }
}));
