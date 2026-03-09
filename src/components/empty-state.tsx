// components/EmptyState.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✦</Text>
      <Text style={styles.title}>Aucune tâche</Text>
      <Text style={styles.subtitle}>
        Appuyez sur <Text style={styles.highlight}>+</Text> pour ajouter votre
        première tâche
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
    gap: 12,
  },
  icon: {
    fontSize: 48,
    color: "#2A2A45",
    marginBottom: 8,
  },
  title: {
    color: "#8888AA",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#555570",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  highlight: {
    color: "#C9A84C",
    fontWeight: "800",
    fontSize: 18,
  },
});
