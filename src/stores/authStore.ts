import type { User } from '@/types/models';
import { create } from 'zustand';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateUser: (patch) =>
    set((s) =>
      s.user ? { user: { ...s.user, ...patch } } : {}
    ),
  setHydrated: (value) => set({ isHydrated: value }),
}));
