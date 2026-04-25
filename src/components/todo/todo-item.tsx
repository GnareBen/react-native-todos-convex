import { useMutation } from "convex/react";
import React, { useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  default as Animated,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { radii, shadows, spacing, typography, useTheme } from "@/theme";

type Priority = "low" | "medium" | "high";

interface Todo {
  _id: Id<"todos">;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

interface Props {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "L",
  medium: "M",
  high: "H",
};

export default function TodoItem({ todo, onEdit }: Props) {
  const { colors } = useTheme();
  const toggleComplete = useMutation(api.todos.toggleComplete);
  const remove = useMutation(api.todos.remove);
  const swipeableRef = useRef<SwipeableMethods>(null);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    scale.value = withSequence(
      withTiming(0.94, { duration: 80 }),
      withTiming(1, { duration: 120 }),
    );
    toggleComplete({ id: todo._id });
  };

  const handleDelete = () => {
    Alert.alert("Supprimer", "Confirmer la suppression ?", [
      {
        text: "Annuler",
        style: "cancel",
        onPress: () => swipeableRef.current?.close(),
      },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => remove({ id: todo._id }),
      },
    ]);
  };

  const renderRightActions = (
    _prog: SharedValue<number>,
    drag: SharedValue<number>,
  ) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const iconStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: interpolate(drag.value, [-80, 0], [1, 0.7], "clamp") },
      ],
    }));
    return (
      <TouchableOpacity
        onPress={handleDelete}
        style={[
          styles.deleteAction,
          {
            backgroundColor: colors.errorMuted,
            borderColor: colors.errorBorder,
          },
        ]}
      >
        <Animated.Text style={[styles.deleteIcon, iconStyle]}>🗑</Animated.Text>
      </TouchableOpacity>
    );
  };

  const priorityCfg = colors.priority[todo.priority];

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
    >
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          {
            backgroundColor: colors.bgSurface,
            borderColor: colors.borderSubtle,
            ...shadows.card,
          },
        ]}
      >
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: priorityCfg.bg, borderColor: priorityCfg.color },
          ]}
        >
          <Text style={[styles.priorityText, { color: priorityCfg.color }]}>
            {PRIORITY_LABEL[todo.priority]}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.content}
          onPress={handleToggle}
          onLongPress={() => onEdit(todo)}
          delayLongPress={350}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.text,
              { color: colors.textPrimary },
              todo.completed && {
                color: colors.textMuted,
                textDecorationLine: "line-through",
              },
            ]}
            numberOfLines={2}
          >
            {todo.text}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {new Date(todo.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {"  ·  "}
            <Text style={[styles.editHint, { color: colors.textDisabled }]}>
              Maintenir pour éditer
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleToggle}
          style={styles.checkbox}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.checkboxInner,
              { borderColor: colors.borderMuted },
              todo.completed && {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
            ]}
          >
            {todo.completed && (
              <Text style={[styles.checkmark, { color: colors.textOnAccent }]}>
                ✓
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.xl,
    marginHorizontal: spacing.lg,
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  priorityBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  priorityText: { ...typography.eyebrow, letterSpacing: 0.5 },
  content: { flex: 1, gap: spacing.xs },
  text: { ...typography.body },
  date: { ...typography.caption, marginTop: 2 },
  editHint: { ...typography.hint },
  checkbox: { marginLeft: spacing.md, padding: spacing.xs },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: { fontSize: 13, fontWeight: "900" },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    marginVertical: 6,
    marginRight: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  deleteIcon: { fontSize: 22 },
});
