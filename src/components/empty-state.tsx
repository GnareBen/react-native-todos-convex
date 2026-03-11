// components/EmptyState.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, typography, spacing } from "../theme";

export default function EmptyState() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { color: colors.borderMuted }]}>✦</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        Aucune tâche
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Appuyez sur{" "}
        <Text style={[styles.highlight, { color: colors.accent }]}>+</Text> pour
        ajouter votre première tâche
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: spacing.md,
  },
  icon: { fontSize: 48, marginBottom: spacing.sm },
  title: { ...typography.title },
  subtitle: { ...typography.body, textAlign: "center", lineHeight: 20 },
  highlight: { fontWeight: "800", fontSize: 18 },
});
