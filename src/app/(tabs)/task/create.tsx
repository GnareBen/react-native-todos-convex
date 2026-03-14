// app/(home)/tasks/create.tsx
import TaskForm, { TaskFormValues } from "@/components/tasks-form";
import { spacing, typography, useTheme } from "@/theme";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../../../convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateTaskScreen() {
  const { colors, isDark } = useTheme();
  const create = useMutation(api.tasks.create);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: TaskFormValues) => {
    setLoading(true);
    try {
      await create(values);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBase }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bgBase}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.backBtn, { color: colors.accent }]}>
            ‹ Retour
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleBlock}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>
          NOUVELLE TÂCHE
        </Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Créer</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TaskForm
          onSubmit={handleSubmit}
          submitLabel="Créer la tâche"
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  backBtn: { ...typography.label, fontSize: 16 },
  titleBlock: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  eyebrow: { ...typography.eyebrow, marginBottom: spacing.xs },
  title: { ...typography.display },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 60,
  },
});
