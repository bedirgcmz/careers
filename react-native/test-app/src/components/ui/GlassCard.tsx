// Glass design system components - Belong's signature UI
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "../../constants/theme";

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  blurIntensity?: number;
  borderRadius?: number;
  style?: ViewStyle;
  gradientColors?: readonly string[];
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  blurIntensity = THEME.glass.blurIntensity,
  borderRadius = THEME.borderRadius.md,
  gradientColors = THEME.glass.gradientColors.card,
  style,
}) => {
  return (
    <View style={StyleSheet.flatten([{ borderRadius, overflow: "hidden" }, style])}>
      <BlurView intensity={blurIntensity} style={StyleSheet.absoluteFillObject} tint="dark" />

      <LinearGradient
        colors={gradientColors as [string, string]}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius,
          borderWidth: 1,
          borderColor: THEME.colors.border,
        }}
      />

      <View style={styles.contentContainer}>{children}</View>
    </View>
  );
};

// Glass Button Component
interface GlassButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "secondary";
  visibility?: "visible" | "hidden";
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = "primary",
  visibility = "visible",
}) => {
  if (visibility === "hidden") {
    return null;
  }

  const gradientColors =
    variant === "primary"
      ? THEME.glass.gradientColors.primary
      : THEME.glass.gradientColors.secondary;

  return (
    <GlassCard gradientColors={gradientColors} style={StyleSheet.flatten([styles.button, style])}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={styles.buttonContent}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={THEME.colors.text.primary} size="small" />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: THEME.spacing.md,
  },
  button: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  visibility: {
    display: "none",
  },
  buttonContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: THEME.colors.text.primary,
    fontSize: THEME.fonts.sizes.md,
    fontWeight: "600",
    lineHeight: 17,
  },
});
