import { create } from 'zustand';

export type ColorScheme = 'light' | 'dark';

type AppState = {
  colorScheme: ColorScheme;
  hasCompletedOnboarding: boolean;
  /** Allow main tabs without API token (catalog only). */
  allowGuestBrowse: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  setOnboardingComplete: (value: boolean) => void;
  setAllowGuestBrowse: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  colorScheme: 'light',
  hasCompletedOnboarding: false,
  allowGuestBrowse: false,
  setColorScheme: (colorScheme) => set({ colorScheme }),
  setOnboardingComplete: (hasCompletedOnboarding) =>
    set({ hasCompletedOnboarding }),
  setAllowGuestBrowse: (allowGuestBrowse) => set({ allowGuestBrowse }),
}));
