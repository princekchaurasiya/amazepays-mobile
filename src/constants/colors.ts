export const Colors = {
  brand: {
    50: '#eef1f8',
    100: '#d4dae9',
    200: '#b7c1de',
    300: '#8ea1cb',
    400: '#5f79b2',
    500: '#2d4490',
    600: '#1b2b5e',
    700: '#152248',
    800: '#101a36',
    900: '#0b1226',
    950: '#080d1c',
  },
  accent: {
    50: '#fff5eb',
    100: '#fee4cc',
    200: '#fecd99',
    300: '#fcb364',
    400: '#f8953a',
    500: '#f5811f',
    600: '#d96c10',
    700: '#a4520b',
    800: '#7a3e0a',
    900: '#5a3009',
    950: '#1d0f02',
  },
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0b1220',
  },
  semantic: {
    background: '#f9fafb',
    surface: '#ffffff',
    surface2: '#f3f4f6',

    primary: '#1b2b5e',
    primaryBright: '#2d4490',
    onPrimary: '#ffffff',

    accent: '#f5811f',
    accentDark: '#a4520b',

    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',

    danger: '#dc2626',
    dangerMutedBg: '#fee2e2',
    success: '#16a34a',
    successMutedBg: '#dcfce7',
    warning: '#d96c10',
    warningMutedBg: '#ffedd5',

    chipActiveBg: '#d4dae9',
  },
} as const;

export type AppColors = typeof Colors;
