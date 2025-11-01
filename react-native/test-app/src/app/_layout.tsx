import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import TrackPlayer from "react-native-track-player";
import { setupTrackPlayer } from "../services/audioService";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Arka plan servisini kaydet (YOL çok önemli)
    TrackPlayer.registerPlaybackService(() => require("../services/playbackService"));

    // Uygulama açılır açılmaz player'ı hazırla
    (async () => {
      try {
        await setupTrackPlayer();
      } catch (e) {
        console.error("TrackPlayer setup failed:", e);
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(modals)" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}
