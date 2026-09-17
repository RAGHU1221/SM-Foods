# GitHub APK Build

This repository is configured to build the Sri Murugan Foods POS Android APK using GitHub Actions.

## Build

1. Push the project to GitHub.
2. Open **Actions**.
3. Select **Build Android APK**.
4. Click **Run workflow**.
5. Wait for the build to complete.
6. Open the completed workflow run.
7. Under **Artifacts**, download `sri-murugan-foods-pos-debug-apk`.

The workflow:
- Node.js 20
- Java 17
- npm install via `npm ci`
- Vite production build
- Capacitor Android platform generation
- Gradle `assembleDebug`
- APK uploaded as a GitHub Actions artifact

## App
Package: `com.srimuruganfoods.pos`
Name: `Sri Murugan Foods POS`

For Play Store release, a signed AAB/APK workflow with a keystore should be added separately. Do not commit the keystore or passwords to GitHub.
