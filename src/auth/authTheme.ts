import { colors } from '@/theme';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/** 4px grid — shared layout helper for auth screens */
export const grid = (n: number) => n * 4;

/**
 * Auth UI uses the same semantic palette as the rest of the app (`@/theme`, Tailwind @theme, DESIGN.md).
 * Ghost outline: DESIGN.md “Ghost Border” (~15% on-surface) for inputs at rest.
 */
const outlineGhost = 'rgba(17, 24, 39, 0.15)';

export const authColors = {
  primary: colors.primary,
  primaryBright: colors.primaryBright,
  accent: colors.accent,
  canvas: colors.background,
  background: colors.surface,
  surface2: colors.surface2,
  text: colors.text,
  textMuted: colors.textMuted,
  border: colors.border,
  error: colors.danger,
  success: colors.success,
  onPrimary: colors.onPrimary,
  outlineGhost,
} as const;

export const authRadii = {
  button: 12,
  input: 16,
  card: 20,
} as const;

export const authFonts = {
  display: 'Manrope_700Bold',
  displayMedium: 'Manrope_600SemiBold',
  label: 'Inter_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
} as const;

export type AuthLayoutMode = 'compact' | 'default' | 'wide';

export function useAuthLayout() {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const landscape = width > height;
    const mode: AuthLayoutMode = width < 375 ? 'compact' : width > 414 ? 'wide' : 'default';
    const horizontal = mode === 'compact' ? grid(4) : grid(6);
    const maxContentWidth = 420;
    return {
      width,
      height,
      landscape,
      mode,
      horizontal,
      maxContentWidth,
      isWideCard: mode === 'wide',
    };
  }, [width, height]);
}
