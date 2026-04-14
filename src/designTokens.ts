/**
 * Design tokens mirrored from the Laravel web app Tailwind theme.
 * Source of truth on web: `amazepays/tailwind.config.js` (`brand`, `accent`, fonts).
 *
 * When marketing changes colors on web, update `tailwind.config.js` and this file together.
 * Optional future step: generate this file from JSON shared between repos.
 */
export const webTailwind = {
  brand: {
    50: '#eef1f8',
    100: '#d4dae9',
    500: '#2d4490',
    600: '#1b2b5e',
    700: '#152248',
    800: '#101a36',
    950: '#080d1c',
  },
  accent: {
    50: '#fff5eb',
    100: '#fee4cc',
    500: '#f5811f',
    600: '#d96c10',
    700: '#a4520b',
    950: '#1d0f02',
  },
} as const;

/** Web `fontFamily.sans` — use system UI on RN; load Inter via expo-font if pixel parity is required */
export const webFontSans = ['Inter var', 'ui-sans-serif', 'system-ui', 'sans-serif'] as const;

export const webFontMono = ['JetBrains Mono', 'ui-monospace', 'monospace'] as const;
