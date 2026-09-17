# Sri Murugan Foods POS — Android Mobile App Build

This project is already a mobile-first React/Vite POS and includes PWA/offline support.
Capacitor configuration has been added so the same app can be packaged as a native Android app.

## Requirements
- Node.js 20+ (LTS recommended)
- Android Studio
- Android SDK + an Android emulator or USB-connected Android phone

## Build Android
```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Then in Android Studio:
1. Let Gradle finish syncing.
2. Connect an Android phone or start an emulator.
3. Run the `app` configuration.
4. For an APK: Build → Build Bundle(s) / APK(s) → Build APK(s).

## App identity
Package ID: `com.srimuruganfoods.pos`
App name: `Sri Murugan Foods POS`

## Notes
- The app remains offline-first because the original project uses local persistence and PWA service-worker caching.
- Native hardware features such as Bluetooth thermal printing, barcode scanning, and Android sharing can be added through Capacitor plugins in the next phase.
