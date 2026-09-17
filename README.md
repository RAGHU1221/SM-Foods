# Sri Murugan Foods — POS Billing & ERP

A full offline-capable POS + ERP web app for Sri Murugan Foods: billing, wholesale billing,
items, item types, customers, ledger, outstanding, receive payment, reports, deleted bills,
hold bills, printer settings, settings and backup — in English and Tamil, with a desktop
sidebar/table layout and a mobile bottom-nav/card layout.

Originally generated from a Figma Make export and rebuilt out into a full multi-screen
React app matching the ERP design spec at `src/imports/pasted_text/pos-erp-design-spec.md`.

## Running the code

```
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

## Works fully offline (PWA)

This app is a installable Progressive Web App:

- **Service worker** (`vite-plugin-pwa`) precaches the app shell (JS/CSS/HTML/icons), so once
  it has been opened one time with internet, it keeps working with **zero connection** —
  including a full page reload or reopening it after the device restarts.
- **All data is saved on the device** via `localStorage` (cart, held bills, saved bills,
  settings, language, theme, login state) — see `src/app/storage.ts`. There is no backend in
  this prototype, so this *is* the offline data layer; wiring it to the real PHP + MySQL
  backend later just means swapping these calls for API calls with the same shape.
- **No external images** — product/category thumbnails are generated locally
  (`src/app/components/shared.tsx` → `ProductThumb`), so nothing ever shows a broken image
  icon when offline.
- A red "Offline — working offline, data is saved on this device" banner appears automatically
  whenever the browser loses connectivity (`useOnlineStatus` in `src/app/storage.ts`).
- Once logged in, the login screen is skipped on future opens (session is remembered on the
  device), so reopening the installed app offline goes straight to the dashboard.

### Installing it as an app

On Chrome/Edge (desktop or Android): open the built/deployed site once, then use the browser's
"Install app" / "Add to Home screen" option. On iOS Safari: Share → "Add to Home Screen". After
that first install, it opens and works like a native app with no browser chrome, online or not.

**Note:** the very first visit needs an internet connection (to download the app once). After
that, everything above works with no network at all.
