import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { THEME } from "../../constants/theme";
import { GlassCard } from "./GlassCard";

type Props = {
  message: string;
  onRetry?: () => void;
  onClose?: () => void;
};

export const ErrorBanner: React.FC<Props> = ({ message, onRetry, onClose }) => {
  return (
    <GlassCard gradientColors={THEME.glass.gradientColors.secondary} style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.title}>Something went wrong</Text>
        {!!onClose && (
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.msg}>{message}</Text>

      {!!onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn} activeOpacity={0.7}>
          <Text style={styles.retryTxt}>Retry</Text>
        </TouchableOpacity>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  wrapper: { padding: THEME.spacing.md, marginBottom: THEME.spacing.md },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: THEME.colors.text.primary, fontWeight: "600", fontSize: 16 },
  close: { color: THEME.colors.text.secondary, fontSize: 16 },
  msg: { color: THEME.colors.text.secondary, marginTop: 6 },
  retryBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    marginTop: 10,
    backgroundColor: THEME.colors.primary,
  },
  retryTxt: { color: THEME.colors.text.primary, fontWeight: "600" },
});
