// Player modal - Full-screen audio player (Expo Router modal)
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { GlassCard, GlassButton } from "../../components/ui/GlassCard";
import { useMusicPlayer } from "../../hooks/useMusicPlayer";
import { THEME } from "../../constants/theme";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { useLocalSearchParams } from "expo-router";
import { useMusicStore } from "../../stores/musicStore";
import { prepareTrack } from "../../services/audioService";

export default function PlayerModal() {
  const {
    currentTrack,
    isPlaying,
    currentPosition,
    duration,
    play,
    pause,
    resume,
    seekTo,
    loading,
    error,
    clearError,
  } = useMusicPlayer();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const challenges = useMusicStore((s) => s.challenges);
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = (): number => {
    if (!duration || duration === 0) return 0;
    return (currentPosition / duration) * 100;
  };

  const handleSeek = (percentage: number) => {
    if (duration) {
      const newPosition = (percentage / 100) * duration;
      seekTo(newPosition);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else if (currentTrack) {
      resume();
    }
  };

  //When the modal is opened/param is changed, prepare the target track (without playing)
  React.useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        // Find track from store
        const target = challenges.find((c) => c.id === id);
        if (!target) return;

        // Update UI state'
        if (!currentTrack || currentTrack.id !== target.id) {
          setCurrentTrack(target);
        }

        // Prepare the native player queue with this track (reset+add, no play)
        await prepareTrack({
          id: target.id,
          url: target.audioUrl,
          title: target.title,
          artist: target.artist,
          duration: target.duration,
        });
      } catch (e) {
        console.error("prepareTrack failed", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      {/* [ADD] Hata varsa sayfanın en üstünde cam banner göster */}
      {!!error && (
        <ErrorBanner
          message={error}
          onRetry={() => currentTrack && play(currentTrack)} // mevcut parçayı yeniden dene
          onClose={clearError}
        />
      )}

      {/* Track yoksa boş kart + yönlendirme metni */}
      {!currentTrack ? (
        <GlassCard style={styles.noTrackCard}>
          <Text style={styles.noTrackText}>No track selected</Text>
          <Text style={styles.noTrackSubtext}>
            Go back and select a challenge to start playing music
          </Text>
        </GlassCard>
      ) : (
        <View style={styles.content}>
          <View>
            {/* Track Info */}
            <GlassCard
              style={styles.trackInfoCard}
              gradientColors={
                currentTrack.completed
                  ? THEME.glass.gradientColors.primary // Tamamlandıysa mor cam efekti
                  : THEME.glass.gradientColors.card // Normal hal
              }
            >
              <Text style={styles.trackTitle}>{currentTrack.title}</Text>
              <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
              <Text style={styles.trackDescription}>{currentTrack.description}</Text>

              <View style={styles.pointsContainer}>
                <Text style={styles.pointsLabel}>Challenge Points</Text>
                <Text style={styles.pointsValue}>{currentTrack.points}</Text>
              </View>
            </GlassCard>

            {currentTrack.completed && <Text style={styles.completedText}>✓</Text>}
          </View>

          {/* Progress Section */}
          <GlassCard
            style={styles.progressCard}
            gradientColors={
              currentTrack.completed
                ? THEME.glass.gradientColors.primary
                : THEME.glass.gradientColors.card
            }
          >
            <Text style={styles.progressLabel}>Listening Progress</Text>

            {/* Progress Bar */}
            <TouchableOpacity
              style={styles.progressTrack}
              onPress={(event) => {
                const { locationX, width } = event.nativeEvent as any;
                const percentage = (locationX / width) * 100;
                handleSeek(percentage);
              }}
            >
              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
              </View>
            </TouchableOpacity>

            {/* Time Display */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* Progress Percentage */}
            <Text style={styles.progressPercentage}>{Math.round(getProgress())}% Complete</Text>
          </GlassCard>

          {/* Controls */}
          <GlassCard
            style={styles.controlsCard}
            gradientColors={
              currentTrack.completed
                ? THEME.glass.gradientColors.primary
                : THEME.glass.gradientColors.card
            }
          >
            <View style={styles.controlsRow}>
              <GlassButton
                title="-10s ⏪"
                onPress={() => handleSeek(Math.max(0, getProgress() - (10 / duration) * 100))}
                variant="secondary"
                style={styles.controlButton}
                textStyle={{ fontSize: 13 }}
              />

              <GlassButton
                title={loading ? "..." : isPlaying ? "⏸️ Pause" : "▶️ Play"}
                onPress={handlePlayPause}
                variant="primary"
                style={styles.mainControlButton}
                loading={loading}
              />

              <GlassButton
                title="⏩ +10s"
                onPress={() => handleSeek(Math.min(100, getProgress() + (10 / duration) * 100))}
                variant="secondary"
                style={styles.controlButton}
                textStyle={{ fontSize: 13 }}
              />
            </View>

            {/* [REMOVE] Kart içinde kırmızı text ile hata — banner varken gerek yok
            {error && <Text style={styles.errorText}>{error}</Text>}
            */}
          </GlassCard>

          {/* Challenge Progress */}
          <GlassCard
            style={styles.challengeCard}
            gradientColors={
              currentTrack.completed
                ? THEME.glass.gradientColors.primary
                : THEME.glass.gradientColors.card
            }
          >
            <Text style={styles.challengeLabel}>Challenge Status</Text>
            <View style={styles.challengeInfo}>
              <Text
                style={[
                  styles.challengeStatus,
                  { color: currentTrack.completed ? THEME.colors.secondary : THEME.colors.accent },
                ]}
              >
                {currentTrack.completed ? "✅ Completed" : "🎧 In Progress"}
              </Text>
              <Text style={styles.challengeProgress}>
                {Math.round(currentTrack.progress)}% of challenge complete
              </Text>
            </View>
          </GlassCard>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  content: { flex: 1, padding: THEME.spacing.lg, justifyContent: "space-between" },

  noTrackCard: { margin: THEME.spacing.xl, alignItems: "center" },
  noTrackText: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: "bold",
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  noTrackSubtext: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    textAlign: "center",
  },

  trackInfoCard: { alignItems: "center" },
  completedText: {
    position: "absolute",
    top: 16,
    right: 16,
    fontSize: THEME.fonts.sizes.xl,
    color: THEME.colors.secondary,
    fontWeight: "bold",
  },
  trackTitle: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: "bold",
    color: THEME.colors.text.primary,
    textAlign: "center",
    marginBottom: THEME.spacing.xs,
  },
  trackArtist: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
  },
  trackDescription: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    textAlign: "center",
    marginBottom: THEME.spacing.lg,
  },
  pointsContainer: { alignItems: "center" },
  pointsLabel: { fontSize: THEME.fonts.sizes.sm, color: THEME.colors.text.secondary },
  pointsValue: { fontSize: THEME.fonts.sizes.xl, fontWeight: "bold", color: THEME.colors.accent },

  progressCard: {},
  progressLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: "600",
    color: THEME.colors.text.primary,
    textAlign: "center",
    marginBottom: THEME.spacing.md,
  },
  progressTrack: { marginBottom: THEME.spacing.md },
  progressBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: THEME.colors.accent, borderRadius: 4 },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: THEME.spacing.sm,
  },
  timeText: { fontSize: THEME.fonts.sizes.sm, color: THEME.colors.text.secondary },
  progressPercentage: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: "bold",
    color: THEME.colors.accent,
    textAlign: "center",
  },

  controlsCard: {},
  controlsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  controlButton: { flex: 0.3, marginHorizontal: THEME.spacing.xs },
  mainControlButton: { flex: 0.4, marginHorizontal: THEME.spacing.xs },

  // [REMOVE] errorText — banner varken gereksiz
  // errorText: {
  //   color: "#FF6B6B",
  //   fontSize: THEME.fonts.sizes.sm,
  //   textAlign: "center",
  //   marginTop: THEME.spacing.md,
  // },

  challengeCard: {},
  challengeLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: "600",
    color: THEME.colors.text.primary,
    textAlign: "center",
    marginBottom: THEME.spacing.md,
  },
  challengeInfo: { alignItems: "center" },
  challengeStatus: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: "bold",
    marginBottom: THEME.spacing.xs,
  },
  challengeProgress: { fontSize: THEME.fonts.sizes.sm, color: THEME.colors.text.secondary },
});
