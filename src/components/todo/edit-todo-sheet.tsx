import { useKeyboardOffset } from "@/hooks/use-keyboard-offset";
import { useMutation } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { radii, shadows, spacing, typography, useTheme } from "../../theme";

type Priority = "low" | "medium" | "high";

interface Todo {
  _id: Id<"todos">;
  text: string;
  priority: Priority;
}

interface Props {
  todo: Todo | null;
  onClose: () => void;
}

const PRIORITIES: { value: Priority; label: string; emoji: string }[] = [
  { value: "low", label: "Basse", emoji: "🟢" },
  { value: "medium", label: "Moyenne", emoji: "🟡" },
  { value: "high", label: "Haute", emoji: "🔴" },
];

export default function EditTodoSheet({ todo, onClose }: Props) {
  const { colors } = useTheme();
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [loading, setLoading] = useState(false);

  const updateText = useMutation(api.todos.updateText);
  const updatePriority = useMutation(api.todos.updatePriority);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useKeyboardOffset();

  useEffect(() => {
    if (todo) {
      setText(todo.text);
      setPriority(todo.priority);
    }
  }, [todo]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 4,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!todo) return;
    if (!text.trim()) {
      shake();
      return;
    }
    setLoading(true);
    try {
      const promises: Promise<unknown>[] = [];
      if (text.trim() !== todo.text)
        promises.push(updateText({ id: todo._id, text: text.trim() }));
      if (priority !== todo.priority)
        promises.push(updatePriority({ id: todo._id, priority }));
      await Promise.all(promises);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = todo
    ? text.trim() !== todo.text || priority !== todo.priority
    : false;

  return (
    <Modal
      visible={!!todo}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bgElevated,
              borderColor: colors.borderSubtle,
              marginBottom: keyboardOffset,
            },
          ]}
        >
          <Pressable>
            <View
              style={[styles.handle, { backgroundColor: colors.borderSubtle }]}
            />

            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Modifier la tâche
              </Text>
              {hasChanges && (
                <View
                  style={[styles.changeDot, { backgroundColor: colors.accent }]}
                />
              )}
            </View>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.bgInput,
                    borderColor: colors.borderAccent,
                    color: colors.textPrimary,
                  },
                ]}
                value={text}
                onChangeText={setText}
                placeholder="Décrivez votre tâche..."
                placeholderTextColor={colors.textDisabled}
                multiline
                maxLength={200}
                autoFocus
              />
              <Text style={[styles.charCount, { color: colors.textDisabled }]}>
                {text.length}/200
              </Text>
            </Animated.View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Priorité
            </Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => {
                const cfg = colors.priority[p.value];
                return (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.priorityChip,
                      { borderColor: cfg.color },
                      priority === p.value && { backgroundColor: cfg.bg },
                    ]}
                    onPress={() => setPriority(p.value)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.priorityEmoji}>{p.emoji}</Text>
                    <Text style={[styles.priorityLabel, { color: cfg.color }]}>
                      {p.label}
                    </Text>
                    {priority === p.value && (
                      <View
                        style={[
                          styles.selectedDot,
                          { backgroundColor: cfg.color },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.accent,
                  ...shadows.button(colors.accentGlow),
                },
                (!hasChanges || loading) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!hasChanges || loading}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitText, { color: colors.textOnAccent }]}>
                {loading ? "Enregistrement..." : "Sauvegarder"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.textMuted }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.xxl,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: { ...typography.title },
  changeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  input: {
    borderWidth: 1.5,
    borderRadius: radii.lg,
    padding: spacing.lg,
    minHeight: 80,
    textAlignVertical: "top",
    ...typography.body,
  },
  charCount: {
    ...typography.caption,
    textAlign: "right",
    marginTop: 6,
    marginRight: 4,
  },
  label: {
    ...typography.eyebrow,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  priorityRow: { flexDirection: "row", gap: spacing.sm },
  priorityChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    gap: 6,
    position: "relative",
  },
  priorityEmoji: { fontSize: 14 },
  priorityLabel: { ...typography.label },
  selectedDot: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  submitBtn: {
    marginTop: spacing.xxxl,
    borderRadius: radii.xl,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.35 },
  submitText: { ...typography.button },
  cancelBtn: {
    marginTop: spacing.md,
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelText: { ...typography.label },
});
