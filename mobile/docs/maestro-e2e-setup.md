# Maestro E2E Setup (React Native + Expo)

## Why Maestro
- Fast end-to-end UI automation for Android/iOS.
- Good fit for Expo projects using development builds.
- Complements existing Jest + Testing Library coverage.

## Prerequisites
- Expo development build installed on emulator/simulator or device (not Expo Go).
- Maestro CLI installed.

## Install Maestro CLI
- macOS (Homebrew): `brew install maestro`
- Cross-platform script: `curl -Ls "https://get.maestro.mobile.dev" | bash`

## Build and run app (Expo dev build)
From `mobile/`:
1. `npx expo prebuild`
2. Android: `npx expo run:android`
3. iOS: `npx expo run:ios`

## Set app id for Maestro
Set `MAESTRO_APP_ID` to the installed app package/bundle id.

Examples:
- PowerShell: `$env:MAESTRO_APP_ID="<your.app.id>"`
- Bash/zsh: `export MAESTRO_APP_ID="<your.app.id>"`

Tip:
- Android package ids can be listed with: `adb shell pm list packages`

## Included flows
- `.maestro/smoke-welcome-login.yaml`
- `.maestro/smoke-login-nearby.yaml`

These cover:
- app launch
- Welcome -> Login navigation
- login via `active-user@example.com`
- landing on Nearby Venues

## Run flows
From `mobile/`:
- `npm run e2e:maestro`
- `npm run e2e:maestro:welcome-login`
- `npm run e2e:maestro:login-nearby`

## Notes
- Flows rely on stable visible text and existing testID `login-identity-input`.
- If app id differs by platform/environment, set `MAESTRO_APP_ID` per run.
