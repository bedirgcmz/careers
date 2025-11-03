import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import TrackPlayer from "react-native-track-player";
import { setupTrackPlayer } from "../services/audioService";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Register background service (PATH is very important)
    TrackPlayer.registerPlaybackService(() => require("../services/playbackService"));

    // Prepare the player as soon as the application opens
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
