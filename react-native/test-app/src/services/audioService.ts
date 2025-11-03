import { Platform } from "react-native";
import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from "react-native-track-player";
import { useMusicStore } from "../stores/musicStore";
let initialized = false;

/** Setup Player */
export async function setupTrackPlayer() {
  if (initialized) return;

  await TrackPlayer.setupPlayer(
    Platform.OS === "android" ? { playBuffer: 1, minBuffer: 1 } : undefined
  );

  await TrackPlayer.updateOptions({
    // iOS + Android
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SeekTo,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],

    // For Android
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },

    progressUpdateEventInterval: 1,
  });

  initialized = true;
}

/** Setup guarantee: if there is no setup where it is called, install it */
export async function ensureSetup() {
  if (initialized) return;
  try {
    await TrackPlayer.getCurrentTrack();
    initialized = true;
  } catch {
    await setupTrackPlayer();
  }
}

/** Add & play tracks */
export async function resetAndPlay(track: {
  id: string;
  url: string;
  title: string;
  artist?: string;
  duration?: number;
  artwork?: string;
}) {
  await ensureSetup();
  await TrackPlayer.reset();
  await TrackPlayer.add(track);
  try {
    const pos = useMusicStore.getState().getPosition(track.id);
    if (pos && pos > 0) {
      await TrackPlayer.seekTo(pos);
    }
  } catch {}
  await TrackPlayer.play();
}

// Prepare track in queue (no play)
export async function prepareTrack(track: {
  id: string;
  url: string;
  title: string;
  artist?: string;
  duration?: number;
  artwork?: string;
}) {
  await ensureSetup();
  await TrackPlayer.reset();
  await TrackPlayer.add(track);
  try {
    const pos = useMusicStore.getState().getPosition(track.id);
    if (pos && pos > 0) {
      await TrackPlayer.seekTo(pos);
    }
  } catch (e) {
    // Go silent: Even if the seek fails, it should not prevent the player from playing.
  }
}

export async function pauseSafe() {
  try {
    await TrackPlayer.pause();
  } catch {}
}

export async function seekSafe(seconds: number) {
  try {
    await TrackPlayer.seekTo(seconds);
  } catch {}
}
