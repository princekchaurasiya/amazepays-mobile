import { webTailwind } from './designTokens';

const b = webTailwind.brand;
const a = webTailwind.accent;

/**
 * Light “storefront / auth” look — matches web `auth-page`, `.card`, `.btn-primary`
 * (`amazepays/resources/css/app.css`). Keeps brand + accent from Tailwind; uses gray-50
 * page background so the blue/orange logo reads clearly (no dark navy behind dark blue marks).
 */
export const colors = {
  background: '#f9fafb',
  surface: '#ffffff',
  surface2: '#f3f4f6',
  primary: b[600],
  primaryBright: b[500],
  onPrimary: '#ffffff',
  accent: a[500],
  accentDark: a[700],
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  danger: '#dc2626',
  dangerMutedBg: '#fee2e2',
  success: '#16a34a',
  successMutedBg: '#dcfce7',
  warning: a[600],
  warningMutedBg: '#ffedd5',
  chipActiveBg: b[100],
};

export const spacing = (n: number) => n * 8;
