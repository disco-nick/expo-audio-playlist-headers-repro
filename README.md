# expo-audio: `AudioPlaylist` ignores `AudioSource.headers` on Android

On Android, `useAudioPlayer` sends `AudioSource.headers`; `useAudioPlaylist` does not.
Both buttons in the app use the same `source` object (see `App.tsx`). The only
difference is the class.

Tested with `expo@58.0.7`, `expo-audio@58.0.8`. Needs a development build
(Expo Go does not support SDK 58 yet). `expo-audio` is the published package, no
`buildFromSource` needed.

## Steps

1. `npm install`, then in one terminal `node server.js`.
   It returns 403 unless `X-Test-Header: 1` is present, and logs every request with its headers.
2. Build and start the app on Android: `npx expo run:android`.
   The default server URL `http://10.0.2.2:3000` works on the Android emulator (iOS simulator: `npx expo run:ios`, default `http://localhost:3000`).
   On a physical device: `EXPO_PUBLIC_SERVER_URL=http://<your LAN IP>:3000 npx expo run:android`.
3. Watch the server log as the app launches, then press **useAudioPlayer** (plays a 3 s tone) and **useAudioPlaylist** (silent).
   Both hooks fetch the URL on mount, so the requests appear before any button is pressed.

## Expected vs actual

| Hook | Server log at launch | Result |
| --- | --- | --- |
| `useAudioPlayer` | one `-> 200` or `-> 206` (`okhttp`), `x-test-header: "1"` present | button plays a 3 s tone |
| `useAudioPlaylist` | several `-> 403` (`Dalvik`, retried), no `x-test-header` | button is silent, no error in JS |

iOS: not tested in this repro.
