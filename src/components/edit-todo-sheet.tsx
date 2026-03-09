// components/EditTodoSheet.tsx
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
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

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

const PRIORITIES: {
  value: Priority;
  label: string;
  color: string;
  emoji: string;
}[] = [
  { value: "low", label: "Basse", color: "#4CAF50", emoji: "🟢" },
  { value: "medium", label: "Moyenne", color: "#FFB830", emoji: "🟡" },
  { value: "high", label: "Haute", color: "#FF5252", emoji: "🔴" },
];

export default function EditTodoSheet({ todo, onClose }: Props) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [loading, setLoading] = useState(false);

  const updateText = useMutation(api.todos.updateText);
  const updatePriority = useMutation(api.todos.updatePriority);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useKeyboardOffset();

  // Pré-remplir quand le todo change
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

      if (text.trim() !== todo.text) {
        promises.push(updateText({ id: todo._id, text: text.trim() }));
      }
      if (priority !== todo.priority) {
        promises.push(updatePriority({ id: todo._id, priority }));
      }

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
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.sheet, { marginBottom: keyboardOffset }]}>
          <Pressable>
            {/* Handle */}
            <View style={styles.handle} />

            <View style={styles.titleRow}>
              <Text style={styles.title}>Modifier la tâche</Text>
              {hasChanges && <View style={styles.changeDot} />}
            </View>

            {/* Text input */}
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Décrivez votre tâche..."
                placeholderTextColor="#3A3A5C"
                multiline
                maxLength={200}
                autoFocus
              />
              <Text style={styles.charCount}>{text.length}/200</Text>
            </Animated.View>

            {/* Priority selector */}
            <Text style={styles.label}>Priorité</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityChip,
                    { borderColor: p.color },
                    priority === p.value && { backgroundColor: p.color + "22" },
                  ]}
                  onPress={() => setPriority(p.value)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.priorityEmoji}>{p.emoji}</Text>
                  <Text style={[styles.priorityLabel, { color: p.color }]}>
                    {p.label}
                  </Text>
                  {priority === p.value && (
                    <View
                      style={[styles.selectedDot, { backgroundColor: p.color }]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!hasChanges || loading) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!hasChanges || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>
                {loading ? "Enregistrement..." : "Sauvegarder"}
              </Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#12122A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: "#2A2A45",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#2A2A45",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  title: {
    color: "#E8E8F0",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  changeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C9A84C",
    marginTop: 2,
  },
  input: {
    backgroundColor: "#1A1A2E",
    borderWidth: 1.5,
    borderColor: "#C9A84C44", // bordure dorée pour distinguer du mode création
    borderRadius: 14,
    padding: 16,
    color: "#E8E8F0",
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    color: "#3A3A5C",
    fontSize: 11,
    textAlign: "right",
    marginTop: 6,
    marginRight: 4,
  },
  label: {
    color: "#8888AA",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 12,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },
  priorityChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
    position: "relative",
  },
  priorityEmoji: { fontSize: 14 },
  priorityLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  selectedDot: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  submitBtn: {
    marginTop: 28,
    backgroundColor: "#C9A84C",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.35,
  },
  submitText: {
    color: "#0D0D1A",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelText: {
    color: "#555570",
    fontSize: 14,
    fontWeight: "600",
  },
});
