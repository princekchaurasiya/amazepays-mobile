import { Colors } from './constants/colors';

/**
 * Light “storefront / auth” look — matches web `auth-page`, `.card`, `.btn-primary`
 * (`amazepays/resources/css/app.css`). Keeps brand + accent from Tailwind; uses gray-50
 * page background so the blue/orange logo reads clearly (no dark navy behind dark blue marks).
 */
export const colors = {
  ...Colors.semantic,
};

export const spacing = (n: number) => n * 8;

/** Max content width for tab screens on large phones / tablets. */
export const layout = {
  contentMaxWidth: 560,
} as const;
