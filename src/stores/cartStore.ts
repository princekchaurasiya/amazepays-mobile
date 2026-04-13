import type { CartItem } from '@/types/models';
import { create } from 'zustand';

type CartState = {
  items: CartItem[];
  promoCode: string | null;
  discountAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, qty: number) => void;
  setPromo: (code: string | null, discount: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  promoCode: null,
  discountAmount: 0,
  addItem: (item) =>
    set((s) => {
      const i = s.items.findIndex((x) => x.sku === item.sku && x.denomination === item.denomination);
      if (i >= 0) {
        const next = [...s.items];
        next[i] = { ...next[i], quantity: next[i].quantity + item.quantity };
        return { items: next };
      }
      return { items: [...s.items, item] };
    }),
  removeItem: (sku) =>
    set((s) => ({ items: s.items.filter((x) => x.sku !== sku) })),
  updateQuantity: (sku, qty) =>
    set((s) => ({
      items: s.items
        .map((x) => (x.sku === sku ? { ...x, quantity: Math.max(1, qty) } : x))
        .filter((x) => x.quantity > 0),
    })),
  setPromo: (code, discount) => set({ promoCode: code, discountAmount: discount }),
  clearCart: () => set({ items: [], promoCode: null, discountAmount: 0 }),
  getSubtotal: () =>
    get().items.reduce(
      (sum, it) => sum + Number(it.denomination) * it.quantity,
      0
    ),
}));
