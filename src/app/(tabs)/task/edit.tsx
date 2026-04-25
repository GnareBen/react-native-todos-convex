// app/(home)/tasks/edit.tsx
import TaskForm, { TaskFormValues } from "@/components/task/tasks-form";
import { spacing, typography, useTheme } from "@/theme";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function EditTaskScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const update = useMutation(api.tasks.update);
  const [loading, setLoading] = useState(false);

  // On récupère la task depuis le cache Convex — pas de query dédiée nécessaire
  // si la liste est déjà chargée. Sinon ajoute une query getById dans tasks.ts.
  const tasks = useQuery(api.tasks.list);
  const task = tasks?.find((t) => t._id === (id as Id<"tasks">));

  const handleSubmit = async (values: TaskFormValues) => {
    if (!id) return;
    setLoading(true);
    try {
      await update({ id: id as Id<"tasks">, ...values });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (!tasks) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBase }]}>
        <ActivityIndicator
          style={styles.loader}
          color={colors.accent}
          size="large"
        />
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBase }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Tâche introuvable.
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backBtn, { color: colors.accent }]}>
              ‹ Retour
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={[styles.eyebrow, { color: colors.accent }]}>MODIFIER</Text>
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TaskForm
          initialValues={{
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
          }}
          onSubmit={handleSubmit}
          submitLabel="Sauvegarder"
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { flex: 1 },
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  errorText: { ...typography.body },
});
