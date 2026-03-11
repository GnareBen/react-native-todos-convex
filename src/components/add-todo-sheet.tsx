// components/AddTodoSheet.tsx
import { useKeyboardOffset } from "@/hooks/use-keyboard-offset";
import { useUser } from "@clerk/expo";
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
import { radii, shadows, spacing, typography, useTheme } from "../theme";

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
  const { user } = useUser();

  const { colors } = useTheme();
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
      await create({
        text: text.trim(),
        priority,
        userEmail: user?.emailAddresses[0]?.emailAddress ?? "",
      });
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
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={handleClose}
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

            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Nouvelle tâche
            </Text>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.bgInput,
                    borderColor: colors.borderMuted,
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
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={handleSubmit}
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
                loading && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitText, { color: colors.textOnAccent }]}>
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
  title: { ...typography.title, marginBottom: spacing.xl },
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
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { ...typography.button },
});
