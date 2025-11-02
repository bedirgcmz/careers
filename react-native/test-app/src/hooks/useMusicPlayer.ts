import { useCallback, useEffect, useState } from "react";
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { ensureSetup, resetAndPlay, pauseSafe, seekSafe } from "../services/audioService";
import { useMusicStore, selectCurrentTrack, selectIsPlaying } from "../stores/musicStore";
import { useUserStore } from "../stores/userStore";
import type { MusicChallenge, UseMusicPlayerReturn } from "../types";

export const useMusicPlayer = (): UseMusicPlayerReturn => {
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = () => setError(null);
  const currentTrack = useMusicStore(selectCurrentTrack);
  const isPlaying = useMusicStore(selectIsPlaying);
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack);
  const setIsPlaying = useMusicStore((s) => s.setIsPlaying);
  const setCurrentPosition = useMusicStore((s) => s.setCurrentPosition);
  const updateProgress = useMusicStore((s) => s.updateProgress);
  const markChallengeComplete = useMusicStore((s) => s.markChallengeComplete);

  const addPoints = useUserStore((s) => s.addPoints);
  const completeChallenge = useUserStore((s) => s.completeChallenge);

  // Native isPlaying -> store
  useEffect(() => {
    let stateValue: any = playbackState as any;
    if (stateValue && typeof stateValue === "object" && "state" in stateValue) {
      stateValue = stateValue.state;
    }
    const playing = stateValue === State.Playing;
    if (playing !== isPlaying) setIsPlaying(playing);
  }, [playbackState, isPlaying, setIsPlaying]);

  // Progress + points
  useEffect(() => {
    if (currentTrack && progress.duration > 0) {
      setCurrentPosition(progress.position);
      const pct = (progress.position / progress.duration) * 100;
      updateProgress(currentTrack.id, pct);

      if (pct >= 90 && !currentTrack.completed) {
        markChallengeComplete(currentTrack.id);
        completeChallenge(currentTrack.id);
        addPoints(currentTrack.points);
      }
    }
  }, [
    progress.position,
    progress.duration,
    currentTrack,
    setCurrentPosition,
    updateProgress,
    markChallengeComplete,
    completeChallenge,
    addPoints,
  ]);

  // Hata olayları
  useTrackPlayerEvents([Event.PlaybackError], (event) => {
    if (event.type === Event.PlaybackError) {
      setError(`Playback error: ${event.message}`);
      setLoading(false);
    }
  });

  const play = useCallback(
    async (track: MusicChallenge) => {
      try {
        setLoading(true);
        setError(null);

        // Kurulum garanti
        await ensureSetup();

        // Oynat
        await resetAndPlay({
          id: track.id,
          url: track.audioUrl,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
        });

        setCurrentTrack(track);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Playback failed";
        setError(msg);
        console.error("TrackPlayer error:", err);
      } finally {
        setLoading(false);
      }
    },
    [setCurrentTrack]
  );

  const pause = useCallback(async () => {
    await pauseSafe();
  }, []);
  const seekTo = useCallback(async (seconds: number) => {
    await seekSafe(seconds);
  }, []);
  const resume = useCallback(async () => {
    try {
      await TrackPlayer.play();
    } catch (e) {
      console.error("Resume error:", e);
    }
  }, []);

  let stateValue: any = playbackState as any;
  if (stateValue && typeof stateValue === "object" && "state" in stateValue)
    stateValue = stateValue.state;

  return {
    isPlaying: stateValue === State.Playing,
    currentTrack,
    currentPosition: progress.position,
    duration: progress.duration,
    play,
    pause,
    seekTo,
    resume,
    loading,
    error,
    clearError,
  };
};
