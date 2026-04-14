# Emulator & simulator setup (AmazePays Mobile)

Test the app from [`amazepays-mobile`](../) on **Android** (full support on Windows) and **iOS** (needs macOS or a physical device).

---

## Prerequisites

- **Node.js** LTS + npm (on Windows PowerShell, if scripts are blocked use `npm.cmd` instead of `npm`)
- From project root:
  ```bash
  cd amazepays-mobile
  cp .env.example .env
  npm install --legacy-peer-deps
  ```

---

## Android (recommended on Windows)

### What to install

1. **Android Studio** (includes **Android SDK** and **Android Emulator**).
2. During setup, install:
   - Android SDK Platform (API 34 or 35 is typical for current Expo)
   - **Android Virtual Device (AVD)** — e.g. Pixel 6 + latest stable API image

### Run the app

1. Start an **AVD** from Android Studio → Device Manager (or cold boot once before `npm run android`).
2. Start the Laravel API on the host (e.g. `php artisan serve` on port **8000**).
3. In `.env` set:
   ```env
   EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
   ```
   The emulator maps **`10.0.2.2`** to your PC’s `localhost`.
4. From `amazepays-mobile`:
   ```bash
   npm.cmd start
   ```
   If you see *“No compatible apps connected… Hermes”* in the terminal, that is **normal** until you open the app — press **`a`** or see **[EXPO_DEV_SERVER.md](./EXPO_DEV_SERVER.md)**.
   Then press **`a`** for Android, or in a second terminal:
   ```bash
   npm.cmd run android
   ```

### Troubleshooting

- **`No Android connected device found, and no emulators could be started automatically`:** Expo needs either a **running emulator** or a **USB device**. Android Studio’s installer does not create an AVD by itself—you must add one and **start** it before pressing `a` in Expo.
  1. Open **Android Studio** → **More Actions** → **Virtual Device Manager** (or **Tools → Device Manager**).
  2. **Create Device** → pick a phone (e.g. Pixel 6) → **Next** → download a **system image** (API **34** or **35**, with the **Google Play** variant if offered) → **Finish**.
  3. Click the **Play** button on that AVD and wait until the phone home screen appears.
  4. In PowerShell, confirm the device is visible:
     ```text
     "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices
     ```
     You should see a line like `emulator-5554   device`.
  5. Run `npm.cmd start` again and press **`a`**.
- **Optional (helps Expo and other tools find the SDK on Windows):** set user environment variables:
  - `ANDROID_HOME` = `C:\Users\<you>\AppData\Local\Android\Sdk` (replace `<you>` with your Windows username).
  - Add to **Path**: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator`.
  - Restart the terminal (or Cursor) after changing env vars.
- **Connection refused to API:** wrong port, firewall, or use `10.0.2.2` not `127.0.0.1` on the emulator.
- **Stuck on splash / Metro “connection refused” on emulator (phone on same PC was fine):** the emulator is a separate device. Fix it in this order:
  1. In `.env` use **`EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1`** (not `localhost`, not only your LAN IP) while testing on the AVD, then restart Expo with **`npx expo start -c`**.
  2. Forward Metro to the emulator (PowerShell, SDK path may differ):
     ```text
     & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
     ```
     Then start Expo with **`npx expo start --localhost`** and press **`a`**. (Or keep default LAN mode if `adb reverse` is in place and the app opens the right URL.)
  3. If the emulator status bar shows no connectivity, **cold boot** the AVD (Device Manager → dropdown on the device → **Cold Boot Now**) or create a new AVD with a **Google Play** system image.
  4. Last resort: **`npx expo start --tunnel`** (PC must allow **ngrok** through the firewall).
- **`npm` blocked in PowerShell:** use `npm.cmd` or set execution policy for CurrentUser (see project `README.md`).

---

## iOS Simulator (macOS only)

### What to install

- **Xcode** from the Mac App Store (includes **iOS Simulator**).

### Run the app

1. Install CocoaPods dependencies if you eject or use dev client (Expo managed workflow often handles this via prebuild when needed).
2. From `amazepays-mobile`:
   ```bash
   npm start
   ```
   Press **`i`** for iOS Simulator, or:
   ```bash
   npm run ios
   ```
3. For API URL on simulator, **`localhost` or `127.0.0.1`** usually works for `php artisan serve` on the same Mac.

---

## iOS on Windows

Apple does **not** ship the iOS Simulator for Windows. Options:

| Option | Notes |
|--------|--------|
| **Physical iPhone** | Install **Expo Go** from the App Store; run `npm start` and scan the QR code (same LAN as PC). |
| **EAS / TestFlight** | Build with `eas build` and install a preview build (Apple developer account required). |
| **macOS VM / cloud Mac** | Use a remote Mac for Xcode + Simulator (CI or MacStadium-style services). |

---

## Physical Android device (optional)

1. Enable **Developer options** + **USB debugging**.
2. Connect USB; allow debugging on the device.
3. Use your PC’s **LAN IP** for the API, e.g. `http://192.168.1.x:8000/api/v1` in `.env` (phone must reach that IP).

---

## Related

- [MOBILE_PROGRESS.md](./MOBILE_PROGRESS.md) — feature readiness
- [README.md](../README.md) — install and branch workflow
- [`amazepays/docs/MOBILE_APP.md`](../../amazepays/docs/MOBILE_APP.md) — architecture
