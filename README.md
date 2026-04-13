# AmazePays Mobile

React Native app (Expo SDK 54) for the AmazePays Laravel API. See [`../amazepays/docs/MOBILE_APP.md`](../amazepays/docs/MOBILE_APP.md) for architecture.

## Setup

```bash
cd amazepays-mobile
cp .env.example .env
# Edit EXPO_PUBLIC_API_URL — for Android emulator use http://10.0.2.2:8000/api/v1
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
- **Wallet:** `GET /wallet/balance`, `GET /wallet/transactions`, `POST /wallet/load-request`

Offers endpoints in `src/api/offers.ts` may return empty until exposed on the API.

## EAS Build

Configure `EXPO_PUBLIC_EAS_PROJECT_ID` and run `eas build` after `npm install -g eas-cli` and `eas login`.
