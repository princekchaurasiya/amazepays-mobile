# AmazePays Mobile — Progress Checklist

**Last reviewed:** April 2026  
**Codebase:** `amazepays-mobile` (Expo SDK 54, React Native)  
**Spec reference:** [`amazepays/docs/MOBILE_APP.md`](../../amazepays/docs/MOBILE_APP.md)

This document compares the **target architecture** to **what exists in the repo today**. Status: **Done** (usable in app), **Partial** (wired but incomplete vs spec), **Pending** (not implemented or not found).

---

## Legend

| Status | Meaning |
|--------|---------|
| Done | Screen/API flow exists and is integrated with `/api/v1` patterns used in Laravel |
| Partial | Implemented with gaps, fallbacks, or backend dependency |
| Pending | Missing or only documented |

---

## Core platform

| Area | Status | Notes |
|------|--------|--------|
| Expo + TypeScript | Done | `package.json`, Expo Router |
| API client + auth header | Done | `src/api/client.ts`, Secure Store token |
| 401 → logout + login | Done | `app/_layout.tsx` |
| TanStack Query | Done | Hooks under `src/hooks` |
| Zustand stores | Done | `authStore`, `cartStore`, `appStore` |
| Sentry | Done | `src/sentry.ts` |
| Design tokens vs web | Done | `src/designTokens.ts` maps `amazepays/tailwind.config.js`; `src/theme.ts` consumes |

---

## Authentication & onboarding

| Feature | Status | Notes |
|---------|--------|--------|
| Onboarding screen | Done | `app/(auth)/onboarding.tsx` |
| Phone → OTP send/verify | Done | `app/(auth)/login.tsx`, `src/api/auth.ts` |
| Complete profile (new users) | Done | Same flow + `POST /auth/complete-profile` |
| 2FA (TOTP) step | Done | `login.tsx` + `auth/2fa/verify` |
| Guest browse | Done | `app/index.tsx`, `appStore.allowGuestBrowse` |
| Session hydrate on launch | Done | `app/_layout.tsx` + `auth/me` |

---

## Navigation & tabs

| Feature | Status | Notes |
|---------|--------|--------|
| Root redirect (auth/guest/tabs) | Done | `app/index.tsx` |
| Bottom tabs | Done | `app/(tabs)/_layout.tsx` — Home, Browse, Orders, Wallet, Profile |
| Stack: product, checkout, payment, order, voucher | Done | Under `app/` |

---

## Catalog & discovery

| Feature | Status | Notes |
|---------|--------|--------|
| Categories | Done | `GET /catalog/categories` via `productsApi.categories()` |
| Product list + infinite scroll | Done | `useProductList`, home & browse |
| Product detail | Done | `app/product/[id].tsx`, denominations, qty |
| Search / browse | Done | `app/(tabs)/browse.tsx` |
| Hero slides from `GET /homepage` | Pending | Home uses **offer strips** + static fallback, not homepage slides per MOBILE_APP §5.1 |
| Brands grid | Pending | Not a dedicated screen; categories/products only |

---

## Offers & promos

| Feature | Status | Notes |
|---------|--------|--------|
| List offers | Partial | `src/api/offers.ts` — **fails soft** (empty array) if route missing; README notes API may not expose `/offers` |
| Apply promo | Partial | `offersApi.apply` exists; checkout integration depends on backend |
| Home banners from offers | Partial | Uses `useOffers()` when data exists |

---

## Cart, checkout, payments

| Feature | Status | Notes |
|---------|--------|--------|
| Cart store | Done | `src/stores/cartStore.ts` |
| Checkout form | Done | `app/checkout/index.tsx` — gifting fields, promo, payment method |
| Payment WebView | Done | `app/payment/index.tsx` |
| Wallet payment path | Done | Via order/checkout API as implemented |

---

## Orders & vouchers

| Feature | Status | Notes |
|---------|--------|--------|
| Order list + pagination | Done | `app/(tabs)/orders.tsx`, `useOrders` |
| Order detail | Done | `app/order/[id].tsx` |
| Voucher reveal / QR / share | Done | `app/voucher/[id].tsx`, `react-native-qrcode-svg` |

---

## Wallet & B2B

| Feature | Status | Notes |
|---------|--------|--------|
| Balance + transactions | Done | `app/(tabs)/wallet.tsx`, `src/api/wallet.ts` |
| Load request | Partial | **“Request load (B2B)”** always visible in UI; not gated by server role in layout |
| B2B dashboard / bulk orders | Pending | MOBILE_APP describes B2B variant; **no separate B2B dashboard** in `app/` |

---

## Profile & settings

| Feature | Status | Notes |
|---------|--------|--------|
| Profile summary + roles display | Done | `app/(tabs)/profile.tsx` |
| Push permission toggle | Partial | Requests permission; **no** `POST /profile/push-token` (or equivalent) found in `src/api` |
| Edit profile / Help screens | Pending | Not separate routes; logout + notification toggle only |

---

## Non-functional (spec vs code)

| Area | Status | Notes |
|------|--------|--------|
| Offline cache & banners | Pending | No persistent catalog cache layer as in MOBILE_APP §11 |
| Firebase Analytics | Pending | Not in `package.json` |
| Barcode scanner | Pending | MOBILE_APP mentions `expo-barcode-scanner`; app uses **QR generation** for vouchers, not scanner |
| EAS / store builds | Partial | `README.md` + `eas.json` path exists; org-specific config |

---

## Summary

- **Consumer path** (browse → product → checkout → payment → orders → voucher) is **largely Done** and aligned with the documented API surface under `/api/v1`.
- **Gaps vs full spec:** homepage slides, brands grid, B2B-only UX, push token registration, offline strategy, analytics, and role-gated wallet load.
- **Theme parity with web:** use `src/designTokens.ts` (kept in sync with `amazepays/tailwind.config.js`).

For local run instructions, see [EMULATOR_SETUP.md](./EMULATOR_SETUP.md).
