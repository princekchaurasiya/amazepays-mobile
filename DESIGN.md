# Design System Specification: The Kinetic Vault

## 1. Overview & Creative North Star
This design system is built upon the "Kinetic Vault" creative north star. In the world of high-end fintech, security usually feels heavy and static, while speed often feels flimsy. This system marries the two. It treats the user interface not as a flat screen, but as a digital architectural space where "Precision Editorial" meets "Tactile Security."

We break the standard "dashboard" template by utilizing intentional asymmetry, expansive negative space, and a high-contrast typographic scale. The goal is to move away from generic SaaS aesthetics and toward a bespoke experience that feels as curated as a premium financial broadsheet and as secure as a modern vault.

## 2. Colors
The palette is rooted in a deep, authoritative navy and an energetic, high-visibility orange. This creates a functional duality: Navy for stability and trust; Orange for action and momentum.

### The "No-Line" Rule
To achieve a premium, seamless aesthetic, **1px solid borders are strictly prohibited for sectioning.** We do not separate content with lines. Instead, boundaries must be defined through:
*   **Background Color Shifts:** Using `surface-container-low` sections against a `surface` background.
*   **Tonal Transitions:** Defining functional areas through subtle shifts in the Material tier (e.g., a `surface-container-highest` navigation bar sitting on a `surface-bright` canvas).

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create depth:
*   **Base:** `surface` (#f9f9fb)
*   **Secondary Content:** `surface-container-low` (#f3f3f5)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff)
*   **Floating Elements:** `surface-container-highest` (#e2e2e4)

### The Glass & Gradient Rule
For elements that require "speed" (modals, quick-actions, or tooltips), use **Glassmorphism**. Apply a 20px-40px `backdrop-blur` to semi-transparent `surface` colors. To add "soul" to the UI, main CTAs and hero sections should utilize a subtle linear gradient transitioning from `primary` (#000666) to `primary_container` (#1A237E) at a 135-degree angle.

## 3. Typography
We use a dual-typeface strategy to balance editorial authority with functional clarity.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-premium" feel. Large `display-lg` and `headline-lg` sizes should be set with tight letter-spacing (-0.02em) to feel impactful and bold.
*   **Body & UI Elements (Inter):** The industry standard for readability. Inter handles the heavy lifting for data-dense areas, labels, and secondary information.

**The Typographic Hierarchy:**
*   **Display (Manrope, Bold):** Used for "Welcome" screens and high-level balance overviews.
*   **Title (Inter, Semi-Bold):** Used for card headings and section titles.
*   **Body (Inter, Regular):** Used for all functional descriptions and user data.

## 4. Elevation & Depth
This design system rejects "drop shadows" in favor of **Tonal Layering** and **Ambient Light.**

*   **The Layering Principle:** Instead of adding a shadow to a card, place a `surface-container-lowest` card (Pure White) on a `surface-container-low` background. The slight shift in hex value creates a "soft lift" that feels more sophisticated than a shadow.
*   **Ambient Shadows:** When an element must float (e.g., a Bottom Sheet or a floating Action Button), use a shadow with a blur radius of at least 32px and an opacity no higher than 6%. The shadow color must be a tinted version of `on-surface` (#1a1c1d) to ensure it looks like a natural occlusion of light rather than a grey smudge.
*   **The "Ghost Border" Fallback:** For accessibility in input fields, use a "Ghost Border": the `outline_variant` token at 15% opacity. This provides a target for the eye without breaking the "No-Line" rule.

## 5. Components

### Buttons
*   **Primary:** Solid `primary` background with `on_primary` text. Use `lg` (1rem/16px) roundedness for a friendly yet professional feel.
*   **Secondary/Action:** Solid `secondary_container` (#fd6c00) with `on_secondary_container` (#562000) text. This is reserved for high-conversion moments (e.g., "Pay Now").
*   **Tertiary:** No background. Use `primary` text with a subtle `surface-container-high` hover state.

### Input Fields
*   **Style:** `surface-container-lowest` background with a `md` (0.75rem/12px) corner radius.
*   **States:** On focus, the "Ghost Border" transitions to a 2px `primary` border. Labels use `label-md` in `on_surface_variant`.
*   **Error:** Use `error` (#ba1a1a) for the border and helper text, never the background.

### Cards & Lists
*   **Constraint:** Zero dividers. Separate list items using 16px of vertical white space or by alternating background tones between `surface` and `surface-container-low`.
*   **Interactive Cards:** Should feature a 2px hover lift—not through a shadow, but by transitioning the background color from `surface-container-lowest` to `surface-bright`.

### Additional Component: The "Transaction Glass"
A specific component for fintech: A glassmorphic overlay for transaction receipts. It uses `surface_container_lowest` at 70% opacity with a heavy backdrop blur, creating a "frosted vault" look that emphasizes security and modernism.

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If a screen feels cluttered, increase the padding rather than adding a divider line.
*   **DO** use the `secondary` orange sparingly. It is a "signal" color, not a decorative one.
*   **DO** ensure all touch targets are at least 48px, even if the visual element is smaller.

### Don't
*   **DON'T** use 100% black (#000000) for text or shadows. Use `on_surface` or `primary_fixed_variant`.
*   **DON'T** use the `sm` (4px) roundedness for main UI containers. It feels dated and "sharp." Stick to `DEFAULT` (8px) or `md` (12px).
*   **DON'T** mix the font families. Never use Inter for Headlines or Manrope for small body text; the weights do not translate well across those specific scales.