# expo-audio: `AudioPlaylist` ignores `AudioSource.headers` on Android

Minimal repro. On Android, `useAudioPlayer` sends the headers in `AudioSource.headers`;
`useAudioPlaylist` does not. The app (`App.tsx`) uses one `source` object for both:

```ts
const source = {
  uri: `${SERVER_URL}/track.wav`,
  headers: { 'X-Test-Header': '1' },
};

const player = useAudioPlayer(source);
const playlist = useAudioPlaylist({ sources: [source] });
```

`server.js` is a small Node server (no dependencies) that serves a 3 second tone
and answers `403` unless the request has `X-Test-Header: 1`. It logs every
request with its headers, so you can see on the server whether the header arrived.

## Versions

- `expo@58.0.7`, `expo-audio@58.0.8` (the published package), `react-native@0.88.0-rc.4`
- Android: emulators running Android 15 and Android 12
- iOS: iPhone 17 simulator, iOS 26.5

This uses a development build (`expo-dev-client`), not Expo Go.

## Steps

1. Install and start the server:

   ```sh
   npm install
   node server.js
   ```

2. In a second terminal, build and run the app on an Android emulator:

   ```sh
   npx expo run:android
   ```

   The app calls `http://10.0.2.2:3000`, which is how the Android emulator reaches
   the host. The app allows plain HTTP (`usesCleartextTraffic` on Android, an App
   Transport Security exception on iOS).

3. Look at the server terminal as the app opens. Then press the two buttons in the app.

## What you should see

The app fetches the URL as soon as it opens, so the requests show up in the server
log before you press anything.

| Hook | Server log on Android | Button |
| --- | --- | --- |
| `useAudioPlayer` | one request with `x-test-header: "1"`, answered `200` | plays the tone |
| `useAudioPlaylist` | four requests over about 3 seconds, none with `x-test-header`, all answered `403` | silent |

On iOS (`npx expo run:ios`, which uses `http://localhost:3000`) every request
carries `x-test-header: "1"`, and both buttons play the tone.

## Other devices

To use a physical device, set the server address to your computer's LAN IP, for
example `EXPO_PUBLIC_SERVER_URL=http://192.168.1.20:3000 npx expo run:android`.
I did not test this; I only used the emulator and the simulator.
