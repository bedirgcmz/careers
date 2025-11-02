// src/app/(modals)/challenge-detail.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useEffect, useMemo } from "react";
import { useMusicStore } from "../../stores/musicStore";
import { useMusicPlayer } from "../../hooks/useMusicPlayer";

function fmt(sec?: number) {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ChallengeDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const challenges = useMusicStore((s) => s.challenges);
  const challenge = useMemo(() => challenges.find((c) => c.id === id), [challenges, id]);

  const {
    play,
    pause,
    resume,
    seekTo,
    isPlaying,
    currentTrack,
    currentPosition,
    duration,
    loading,
    error,
  } = useMusicPlayer();

  // Bulunamazsa güvenli çık
  useEffect(() => {
    if (!challenge) {
      Alert.alert("Not found", "Challenge not found.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [challenge, router]);

  if (!challenge) return null;

  const isCurrent = currentTrack?.id === challenge.id;
  const progressPct = Math.round(challenge.progress ?? 0);
  const isCompleted = !!challenge.completed;

  const resumeLabel = (() => {
    if (isCompleted) return "Play Again";
    if (progressPct >= 1) {
      return `Resume from the beginning`;
      //   const resumeAt = challenge.duration ? (progressPct / 100) * challenge.duration : 0;
      //   return `Resume from ${fmt(resumeAt)}`;
    }
    return "Play Challenge";
  })();

  const onPrimary = async () => {
    try {
      await play(challenge);
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111", padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ color: "#ccc", fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600", marginLeft: 8 }}>
          Challenge Detail
        </Text>
      </View>

      {/* Info Card */}
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: "#1c1c1e",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800" }}>{challenge.title}</Text>
        <Text style={{ color: "#cfcfcf", fontSize: 16, marginTop: 6 }}>{challenge.artist}</Text>
        <Text style={{ color: "#a9a9a9", marginTop: 10 }}>
          {challenge.description ?? "Listen to complete this challenge and earn points."}
        </Text>

        <View style={{ marginTop: 16, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#cfcfcf" }}>Duration</Text>
          <Text style={{ color: "#fff" }}>
            {challenge.duration ? fmt(challenge.duration) : "--:--"}
          </Text>
        </View>

        <View style={{ marginTop: 6, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#cfcfcf" }}>Points</Text>
          <Text style={{ color: "#ffd166", fontWeight: "700" }}>{challenge.points}</Text>
        </View>
      </View>

      {/* Progress Card */}
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: "#1c1c1e",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Listening Progress
        </Text>
        <View
          style={{ height: 8, backgroundColor: "#2a2a2a", borderRadius: 8, overflow: "hidden" }}
        >
          <View style={{ width: `${progressPct}%`, backgroundColor: "#f4c430", height: 8 }} />
        </View>
        <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#cfcfcf" }}>
            {isCurrent
              ? fmt(currentPosition)
              : progressPct > 0 && challenge.duration
              ? fmt((progressPct / 100) * challenge.duration)
              : "0:00"}
          </Text>
          <Text style={{ color: "#cfcfcf" }}>{fmt(challenge.duration ?? duration)}</Text>
        </View>
        <Text style={{ color: "#ffd166", fontWeight: "800", marginTop: 10, fontSize: 18 }}>
          {progressPct}% Complete
        </Text>
      </View>

      {/* Controls */}
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: "#1c1c1e",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          marginBottom: 16,
        }}
      >
        {/* Primary action */}
        <TouchableOpacity
          onPress={onPrimary}
          style={{
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            backgroundColor: "#4c46ff",
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>{resumeLabel}</Text>
          )}
        </TouchableOpacity>

        {/* Transport */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => seekTo(Math.max(0, (currentPosition || 0) - 10))}
            style={{ padding: 12, borderRadius: 12, backgroundColor: "#2a2a2a" }}
          >
            <Text style={{ color: "#fff" }}>⏪ 10s</Text>
          </TouchableOpacity>

          {isPlaying ? (
            <TouchableOpacity
              onPress={pause}
              style={{ padding: 12, borderRadius: 12, backgroundColor: "#2a2a2a" }}
            >
              <Text style={{ color: "#fff" }}>⏸ Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={resume}
              style={{ padding: 12, borderRadius: 12, backgroundColor: "#2a2a2a" }}
            >
              <Text style={{ color: "#fff" }}>▶︎ Play</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => seekTo(Math.min((duration || 0) - 1, (currentPosition || 0) + 10))}
            style={{ padding: 12, borderRadius: 12, backgroundColor: "#2a2a2a" }}
          >
            <Text style={{ color: "#fff" }}>10s ⏩</Text>
          </TouchableOpacity>
        </View>

        {/* Error banner */}
        {!!error && (
          <View
            style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: "#3a1f1f" }}
          >
            <Text style={{ color: "#ffb3b3" }}>Playback error: {error}</Text>
          </View>
        )}
      </View>

      {/* Status */}
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: "#1c1c1e",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
          Challenge Status
        </Text>
        <Text style={{ color: isCompleted ? "#9cffb3" : "#ffd166", fontWeight: "700" }}>
          {isCompleted ? "✓ Completed" : "In Progress"}
        </Text>
        <Text style={{ color: "#a9a9a9", marginTop: 4 }}>
          {isCompleted
            ? "You have completed this challenge."
            : "Keep listening to complete the challenge."}
        </Text>
      </View>
    </View>
  );
}
