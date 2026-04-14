# AmazePays Mobile

React Native app (Expo SDK 54) for the AmazePays Laravel API. See [`../amazepays/docs/MOBILE_APP.md`](../amazepays/docs/MOBILE_APP.md) for architecture.

## Docs (this repo)

| Doc | Purpose |
|-----|---------|
| [`docs/MOBILE_PROGRESS.md`](docs/MOBILE_PROGRESS.md) | Feature readiness: done vs partial vs pending |
| [`docs/EMULATOR_SETUP.md`](docs/EMULATOR_SETUP.md) | Android emulator (Windows), iOS Simulator (macOS), physical devices |
| [`docs/EXPO_DEV_SERVER.md`](docs/EXPO_DEV_SERVER.md) | **`npm start`**, Hermes/DevTools message, **`a`** for Android, tunnel, `-c` cache clear |

## Setup

```bash
cd amazepays-mobile
cp .env.example .env
# Edit EXPO_PUBLIC_API_URL — see .env.example (404 = wrong URL: add :8000 for artisan, or /amazepays/public for XAMPP)
npm install --legacy-peer-deps
npm start
```

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable; promote here only after `dev` is verified. |
| `dev` | Integration; merge `intern` here first, test, then merge to `main`. |
| `intern` | Day-to-day work; interns push only to this branch. |

**Intern:** after clone, `git checkout intern` and `git pull origin intern` before working. Then commit and `git push origin intern`.

**Maintainer:** merge intern → dev (`git checkout dev && git pull && git merge intern && git push origin dev`), test, then merge dev → main (`git checkout main && git pull && git merge dev && git push origin main`).

## Backend alignment

Consumer API routes live under `/api/v1` (see Laravel `routes/api.php`):

- **Auth (OTP, no password):** `POST /auth/otp/send`, `POST /auth/otp/verify`, `POST /auth/complete-profile`, `POST /auth/2fa/verify`, `GET /auth/me`, `POST /auth/logout`
- **Catalog:** `GET /catalog`, `GET /catalog/categories`, `GET /catalog/{id}`
- **Orders:** `GET /orders`, `GET /orders/{id}`, `POST /orders`, `GET /orders/{id}/voucher-code`
- **Home / banners:** `GET /home` → `data.slides` (`image_mobile`, `desktop_image`, links). Same records as the web hero carousel.
- **Laravel admin:** edit images under **Settings → Hero carousel** (`/panel/settings/hero-slides`). The **Homepage sections** `banner` row only turns the hero block on/off.

The consumer app does **not** include wallet UI or wallet checkout. Wallet load and balance remain **B2B / admin** flows on the Laravel side (`/api/v1/wallet/*` still exists for authenticated clients if you integrate a B2B app later).

Offers endpoints in `src/api/offers.ts` may return empty until exposed on the API.

## EAS Build

Configure `EXPO_PUBLIC_EAS_PROJECT_ID` and run `eas build` after `npm install -g eas-cli` and `eas login`.
