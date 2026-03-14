import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../../../convex/_generated/api";

import AddTodoSheet from "@/components/add-todo-sheet";
import EditTodoSheet from "@/components/edit-todo-sheet";
import EmptyState from "@/components/empty-state";
import TodoItem from "@/components/todo-item";
import { radii, shadows, spacing, typography, useTheme } from "@/theme";
import { useUser } from "@clerk/expo";

import { useQuery } from "convex/react";
import { useRouter } from "expo-router";

type Filter = "all" | "active" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "active", label: "Actif" },
  { value: "completed", label: "Terminé" },
];

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const todos = useQuery(api.todos.list, {}) ?? [];
  const [filter, setFilter] = useState<Filter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editingTodo, setEditingTodo] = useState<(typeof todos)[0] | null>(
    null,
  );

  const router = useRouter();

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(
    () => ({
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      progress:
        todos.length > 0
          ? todos.filter((t) => t.completed).length / todos.length
          : 0,
    }),
    [todos],
  );

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
            <Text style={[styles.headerEyebrow, { color: colors.accent }]}>
              MES TODOS
            </Text>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Focus
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statsContainer}>
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
            <TouchableOpacity
              onPress={() => router.push("/todo/profile")}
              activeOpacity={0.75}
            >
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={[styles.avatar, { borderColor: colors.borderSubtle }]}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarFallback,
                    {
                      backgroundColor: colors.accentMuted,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[styles.avatarInitials, { color: colors.accent }]}
                  >
                    {(user?.firstName?.[0] ?? "").toUpperCase() || "?"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

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

        {/* Filter tabs */}
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
            <TodoItem todo={item} onEdit={() => setEditingTodo(item)} />
          )}
          contentContainerStyle={[
            styles.list,
            filtered.length === 0 && { flex: 1 },
          ]}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.accent,
              ...shadows.fab(colors.accentGlow),
            },
          ]}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.85}
        >
          <Text style={[styles.fabIcon, { color: colors.textOnAccent }]}>
            +
          </Text>
        </TouchableOpacity>

        <AddTodoSheet visible={showAdd} onClose={() => setShowAdd(false)} />
        <EditTodoSheet
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
        />
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: "700",
  },
  headerEyebrow: { ...typography.eyebrow, marginBottom: spacing.xs },
  headerTitle: { ...typography.display },
  statsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    paddingBottom: 6,
  },
  statsNumber: { fontSize: 28, fontWeight: "800", lineHeight: 32 },
  statsSlash: { fontSize: 20, fontWeight: "300", lineHeight: 30 },
  statsTotal: { fontSize: 18, fontWeight: "600", lineHeight: 28 },
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
    marginTop: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  filterLabel: { ...typography.label },
  list: { paddingBottom: 100, paddingTop: spacing.xs },
  fab: {
    position: "absolute",
    bottom: 36,
    right: spacing.xxl,
    width: 60,
    height: 60,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  fabIcon: { fontSize: 28, fontWeight: "300", lineHeight: 32, marginTop: -2 },
});
