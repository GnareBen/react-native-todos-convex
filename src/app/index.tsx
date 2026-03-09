import { useQuery } from "convex/react";
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
import { api } from "../../convex/_generated/api";

import AddTodoSheet from "@/components/add-todo-sheet";
import EditTodoSheet from "@/components/edit-todo-sheet";
import EmptyState from "@/components/empty-state";
import TodoItem from "@/components/todo-item";

type Filter = "all" | "active" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "active", label: "Actif" },
  { value: "completed", label: "Terminé" },
];

export default function HomeScreen() {
  const todos = useQuery(api.todos.list) ?? [];
  const [filter, setFilter] = useState<Filter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editingTodo, setEditingTodo] = useState<(typeof todos)[0] | null>(
    null,
  );

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
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>MES TÂCHES</Text>
            <Text style={styles.headerTitle}>Focus</Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statsNumber}>{stats.completed}</Text>
            <Text style={styles.statsSlash}>/</Text>
            <Text style={styles.statsTotal}>{stats.total}</Text>
          </View>
        </View>

        {/* Progress bar */}
        {stats.total > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats.progress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
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
                filter === f.value && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterLabel,
                  filter === f.value && styles.filterLabelActive,
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
            <TodoItem todo={item} onEdit={(todo) => setEditingTodo(item)} />
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
          style={styles.fab}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
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
  safe: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerEyebrow: {
    color: "#C9A84C",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#E8E8F0",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    paddingBottom: 6,
  },
  statsNumber: {
    color: "#C9A84C",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },
  statsSlash: {
    color: "#3A3A5C",
    fontSize: 20,
    fontWeight: "300",
    lineHeight: 30,
  },
  statsTotal: {
    color: "#555570",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 28,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 6,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#1A1A2E",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#C9A84C",
    borderRadius: 2,
  },
  progressLabel: {
    color: "#555570",
    fontSize: 11,
    fontWeight: "500",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A45",
    backgroundColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: "#C9A84C22",
    borderColor: "#C9A84C55",
  },
  filterLabel: {
    color: "#555570",
    fontSize: 13,
    fontWeight: "600",
  },
  filterLabelActive: {
    color: "#C9A84C",
  },
  list: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  fab: {
    position: "absolute",
    bottom: 36,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#C9A84C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  fabIcon: {
    color: "#0D0D1A",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 32,
    marginTop: -2,
  },
});
