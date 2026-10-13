import { useAudioPlayer, useAudioPlaylist } from 'expo-audio';
import { StatusBar } from 'expo-status-bar';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

// Defaults reach the host machine from the Android emulator (10.0.2.2) and the iOS simulator (localhost).
// On a physical device set EXPO_PUBLIC_SERVER_URL to http://<LAN IP>:3000.
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? `http://${DEFAULT_HOST}:3000`;

// Both buttons use this exact object.
const source = {
  uri: `${SERVER_URL}/track.wav`,
  headers: { 'X-Test-Header': '1' },
};

export default function App() {
  const player = useAudioPlayer(source);
  const playlist = useAudioPlaylist({ sources: [source] });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AudioSource.headers</Text>
      <Text>{SERVER_URL}</Text>
      <Button title="useAudioPlayer (expected: plays)" onPress={() => player.play()} />
      <Button title="useAudioPlaylist (bug: 403, silent)" onPress={() => playlist.play()} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 },
  title: { fontSize: 20, fontWeight: '600' },
});
