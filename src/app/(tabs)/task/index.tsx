// app/(home)/tasks/index.tsx  ← écran liste + bouton vers création
import ProfileIcon from "@/components/profile/profile-icon";
import TaskItem, { Task } from "@/components/task/tasks-item";
import { radii, spacing, typography, useTheme } from "@/theme";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../../../convex/_generated/api";

type Filter = "all" | "active" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "active", label: "Actif" },
  { value: "completed", label: "Terminé" },
];

export default function TasksScreen() {
  const { colors, isDark } = useTheme();
  const tasks = useQuery(api.tasks.list) ?? [];
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":
        return tasks.filter((t) => !t.completed);
      case "completed":
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      overdue: tasks.filter((t) => !t.completed && t.dueDate < Date.now())
        .length,
      progress:
        tasks.length > 0
          ? tasks.filter((t) => t.completed).length / tasks.length
          : 0,
    }),
    [tasks],
  );

  const handleEdit = (task: Task) => {
    router.push({
      pathname: "/(tabs)/task/edit",
      params: { id: task._id },
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBase }]}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.bgBase}
        />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>
              MES TÂCHES
            </Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Agenda
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statsBlock}>
              <Text style={[styles.statsNumber, { color: colors.accent }]}>
                {stats.completed}
              </Text>
              <Text style={[styles.statsSlash, { color: colors.borderMuted }]}>
                /
              </Text>
              <Text style={[styles.statsTotal, { color: colors.textMuted }]}>
                {stats.total}
              </Text>
            </View>
            <ProfileIcon />
          </View>
        </View>

        {/* Overdue warning */}
        {stats.overdue > 0 && (
          <View
            style={[
              styles.overdueBar,
              {
                backgroundColor: colors.errorMuted,
                borderColor: colors.errorBorder,
              },
            ]}
          >
            <Text style={[styles.overdueText, { color: colors.error }]}>
              ⚠ {stats.overdue} tâche{stats.overdue > 1 ? "s" : ""} en retard
            </Text>
          </View>
        )}

        {/* Progress bar */}
        {stats.total > 0 && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.bgSurface },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${stats.progress * 100}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              {Math.round(stats.progress * 100)}% complété
            </Text>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                { borderColor: colors.borderSubtle },
                filter === f.value && {
                  backgroundColor: colors.accentMuted,
                  borderColor: colors.accent + "55",
                },
              ]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: colors.textMuted },
                  filter === f.value && { color: colors.accent },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TaskItem task={item as Task} onEdit={handleEdit} />
          )}
          contentContainerStyle={[
            styles.list,
            filtered.length === 0 && { flex: 1 },
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyIcon, { color: colors.borderMuted }]}>
                ✦
              </Text>
              <Text
                style={[styles.emptyTitle, { color: colors.textSecondary }]}
              >
                Aucune tâche
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Appuyez sur{" "}
                <Text style={{ color: colors.accent, fontWeight: "800" }}>
                  +
                </Text>{" "}
                pour en créer une
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.accent,
              shadowColor: colors.accentGlow,
            },
          ]}
          onPress={() => router.push("/(tabs)/task/create")}
          activeOpacity={0.85}
        >
          <Text style={[styles.fabIcon, { color: colors.textOnAccent }]}>
            +
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  eyebrow: { ...typography.eyebrow, marginBottom: spacing.xs },
  title: { ...typography.display },
  statsBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    paddingBottom: 6,
  },
  statsNumber: { fontSize: 28, fontWeight: "800", lineHeight: 32 },
  statsSlash: { fontSize: 20, fontWeight: "300", lineHeight: 30 },
  statsTotal: { fontSize: 18, fontWeight: "600", lineHeight: 28 },
  overdueBar: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  overdueText: { ...typography.label },
  progressContainer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    gap: 6,
  },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressLabel: { ...typography.caption, fontWeight: "500" },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  filterLabel: { ...typography.label },
  list: { paddingBottom: 100, paddingTop: spacing.xs },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.sm },
  emptyTitle: { ...typography.title },
  emptySubtitle: { ...typography.body, textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: 36,
    right: spacing.xxl,
    width: 60,
    height: 60,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  fabIcon: { fontSize: 28, fontWeight: "300", lineHeight: 32, marginTop: -2 },
});
