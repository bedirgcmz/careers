import { Platform } from "react-native";
import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from "react-native-track-player";

let initialized = false;

/** Player'ı 1 kez kur (idempotent) */
export async function setupTrackPlayer() {
  if (initialized) return;

  // Sade ve güvenilir kurulum
  await TrackPlayer.setupPlayer(
    Platform.OS === "android"
      ? { playBuffer: 1, minBuffer: 1 } // Android'de ek buffer ayarları zararsız
      : undefined
  );

  await TrackPlayer.updateOptions({
    // iOS + Android ortak
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SeekTo,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],
    // İstersen atlama aralıkları (opsiyonel)
    // forwardJumpInterval: 10,
    // backwardJumpInterval: 10,

    // RNTP v4'te iOS sesi kategorisi burada verilmez.
    // Onu app.json config plugin’i hallediyor.

    // Android’e özel
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      // notificationIcon: 'mipmap/ic_launcher', // istersen
    },

    // Olay gönderim aralığı (desteklenir)
    progressUpdateEventInterval: 1,
  });

  initialized = true;
}

/** Setup garanti: çağrıldığı yerde kurulum yoksa kur */
export async function ensureSetup() {
  if (initialized) return;
  try {
    await TrackPlayer.getCurrentTrack();
    initialized = true;
  } catch {
    await setupTrackPlayer();
  }
}

/** Track ekle & çal */
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
  await TrackPlayer.play();
}

// Parçayı kuyrukta hazırla (oynatma yok)
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
