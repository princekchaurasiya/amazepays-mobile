# Expo dev server — commands & troubleshooting

Use this when you run **`npm start`** / **`expo start`** and see logs like *“No compatible apps connected, React Native DevTools can only be used with Hermes”*.

---

## Quick start (Windows)

From the project root:

```powershell
cd c:\xampp\htdocs\amazepays-mobile
npm.cmd start
```

- **Stop the server:** press **Ctrl+C** in that terminal.
- **If `npm` fails in PowerShell** (execution policy): use **`npm.cmd`** for every command below, or fix policy once (see [README](../README.md)).

---

## Connect the app (required for logs & DevTools)

That Hermes / DevTools line is **normal until a device or emulator is running your app**. It is **not** a crash.

1. **Android emulator (recommended on Windows)**  
   - Start an AVD in Android Studio (**Device Manager** → Play).  
   - In the Expo terminal, press **`a`** to open **Android**.  
   - Or in a **second** terminal:
     ```powershell
     cd c:\xampp\htdocs\amazepays-mobile
     npm.cmd run android
     ```

2. **Physical phone**  
   - Install **Expo Go** (same Wi‑Fi as the PC).  
   - Scan the QR code from the terminal.

3. **If the phone can’t reach the bundler** (firewall / different network):
   ```powershell
   npx expo start --tunnel
   ```

---

## Useful Expo CLI commands

| Goal | Command |
|------|---------|
| Default dev server | `npm.cmd start` or `npx expo start` |
| Open Android directly | `npm.cmd run android` |
| Clear Metro cache (weird bundler errors) | `npx expo start -c` |
| Different port (8081 busy) | `npx expo start --port 8085` |

---

## Hermes & React Native DevTools

- **Hermes** is the default JS engine for this Expo SDK; you don’t need to “turn it on” for normal dev.
- **DevTools** attach **after** the app is connected. Until then, Expo may print the “No compatible apps connected” debug line — **ignore it** or connect an emulator (`a`) / Expo Go.
- Official note: [Using Hermes](https://docs.expo.dev/guides/using-hermes/).

---

## Backend (Laravel API) reminder

The app expects **`EXPO_PUBLIC_API_URL`** in `.env` (no trailing slash), e.g.:

- Android **emulator** + `php artisan serve`: `http://10.0.2.2:8000/api/v1`
- Physical device on same LAN: `http://YOUR_PC_IP:8000/api/v1`

See [EMULATOR_SETUP.md](./EMULATOR_SETUP.md) for ADB, API URL, and firewall tips.

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [EMULATOR_SETUP.md](./EMULATOR_SETUP.md) | AVD, `adb`, `10.0.2.2`, iOS |
| [MOBILE_PROGRESS.md](./MOBILE_PROGRESS.md) | Feature checklist |
| [README.md](../README.md) | Install, branches, API list |
