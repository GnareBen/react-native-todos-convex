// components/TodoItem.tsx
import { useMutation } from "convex/react";
import React, { useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  default as Animated,
  interpolate,
  default as Reanimated,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

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

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string }> = {
  low: { color: "#4CAF50", label: "L" },
  medium: { color: "#FFB830", label: "M" },
  high: { color: "#FF5252", label: "H" },
};

export default function TodoItem({ todo, onEdit }: Props) {
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
      <TouchableOpacity onPress={handleDelete} style={styles.deleteAction}>
        <Reanimated.Text style={[styles.deleteIcon, iconStyle]}>
          🗑
        </Reanimated.Text>
      </TouchableOpacity>
    );
  };

  const priority = PRIORITY_CONFIG[todo.priority];

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={true}
      friction={2}
      rightThreshold={40}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Priority indicator */}
        <View
          style={[
            styles.priorityBadge,
            {
              backgroundColor: priority.color + "22",
              borderColor: priority.color,
            },
          ]}
        >
          <Text style={[styles.priorityText, { color: priority.color }]}>
            {priority.label}
          </Text>
        </View>

        {/* Content */}
        <TouchableOpacity
          style={styles.content}
          onPress={handleToggle}
          onLongPress={() => onEdit(todo)}
          delayLongPress={350}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.text, todo.completed && styles.textCompleted]}
            numberOfLines={2}
          >
            {todo.text}
          </Text>
          <Text style={styles.date}>
            {new Date(todo.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {"  ·  "}
            <Text style={styles.editHint}>Maintenir pour éditer</Text>
          </Text>
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
              todo.completed && styles.checkboxChecked,
            ]}
          >
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
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
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#2A2A45",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  priorityBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  text: {
    color: "#E8E8F0",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 21,
    letterSpacing: 0.2,
  },
  textCompleted: {
    color: "#555570",
    textDecorationLine: "line-through",
  },
  date: {
    color: "#555570",
    fontSize: 11,
    marginTop: 2,
  },
  editHint: {
    color: "#3A3A5C",
    fontSize: 10,
    fontStyle: "italic",
  },
  checkbox: {
    marginLeft: 12,
    padding: 4,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#3A3A5C",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#C9A84C",
    borderColor: "#C9A84C",
  },
  checkmark: {
    color: "#0D0D1A",
    fontSize: 13,
    fontWeight: "900",
  },
  deleteAction: {
    backgroundColor: "#FF525222",
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    marginVertical: 6,
    marginRight: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF525244",
  },
  deleteIcon: {
    fontSize: 28,
  },
});
