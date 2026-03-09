// components/AddTodoSheet.tsx
import { useKeyboardOffset } from "@/hooks/use-keyboard-offset";
import { useMutation } from "convex/react";
import React, { useRef, useState } from "react";
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

type Priority = "low" | "medium" | "high";

interface Props {
  visible: boolean;
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

export default function AddTodoSheet({ visible, onClose }: Props) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [loading, setLoading] = useState(false);

  const create = useMutation(api.todos.create);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useKeyboardOffset();

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
    if (!text.trim()) {
      shake();
      return;
    }
    setLoading(true);
    try {
      await create({ text: text.trim(), priority });
      setText("");
      setPriority("medium");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText("");
    setPriority("medium");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Animated.View style={[styles.sheet, { marginBottom: keyboardOffset }]}>
          <Pressable>
            {/* Handle */}
            <View style={styles.handle} />

            <Text style={styles.title}>Nouvelle tâche</Text>

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
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
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
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>
                {loading ? "Enregistrement..." : "Ajouter la tâche"}
              </Text>
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
  title: {
    color: "#E8E8F0",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1A1A2E",
    borderWidth: 1.5,
    borderColor: "#2A2A45",
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
    opacity: 0.6,
  },
  submitText: {
    color: "#0D0D1A",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
