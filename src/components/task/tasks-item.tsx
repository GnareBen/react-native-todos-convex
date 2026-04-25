import { radii, shadows, spacing, typography, useTheme } from "@/theme";
import { useMutation } from "convex/react";
import React, { useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type Priority = "low" | "medium" | "high";

export interface Task {
  _id: Id<"tasks">;
  title: string;
  description: string;
  dueDate: number;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
}

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "L",
  medium: "M",
  high: "H",
};

export default function TaskItem({ task, onEdit }: Props) {
  const { colors } = useTheme();
  const toggleComplete = useMutation(api.tasks.toggleComplete);
  const remove = useMutation(api.tasks.remove);
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
    toggleComplete({ id: task._id });
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
        onPress: () => remove({ id: task._id }),
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

  const priorityCfg = colors.priority[task.priority];
  const isOverdue = !task.completed && task.dueDate < Date.now();

  const formattedDueDate = new Date(task.dueDate).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });

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
        {/* Priority badge */}
        <View
          style={[
            styles.priorityBadge,
            {
              backgroundColor: priorityCfg.bg,
              borderColor: priorityCfg.color,
            },
          ]}
        >
          <Text style={[styles.priorityText, { color: priorityCfg.color }]}>
            {PRIORITY_LABEL[task.priority]}
          </Text>
        </View>

        {/* Content */}
        <TouchableOpacity
          style={styles.content}
          onPress={handleToggle}
          onLongPress={() => onEdit(task)}
          delayLongPress={350}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary },
              task.completed && {
                color: colors.textMuted,
                textDecorationLine: "line-through",
              },
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>

          {task.description ? (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {task.description}
            </Text>
          ) : null}

          <View style={styles.meta}>
            <Text
              style={[
                styles.dueDate,
                { color: isOverdue ? colors.error : colors.textMuted },
              ]}
            >
              {isOverdue ? "⚠ " : "📅 "}
              {formattedDueDate}
            </Text>
            <Text style={[styles.editHint, { color: colors.textDisabled }]}>
              Maintenir pour éditer
            </Text>
          </View>
        </TouchableOpacity>

        {/* Checkbox */}
        <TouchableOpacity
          onPress={handleToggle}
          style={styles.checkbox}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.checkboxInner,
              { borderColor: colors.borderMuted },
              task.completed && {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
            ]}
          >
            {task.completed && (
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
  content: { flex: 1, gap: 3 },
  title: { ...typography.body },
  description: { ...typography.caption, lineHeight: 16 },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  dueDate: { ...typography.caption, fontWeight: "600" },
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
