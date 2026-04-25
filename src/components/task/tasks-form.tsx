import { radii, shadows, spacing, typography, useTheme } from "@/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Priority = "low" | "medium" | "high";

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: number;
  priority: Priority;
}

interface Props {
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

const PRIORITIES: { value: Priority; label: string; emoji: string }[] = [
  { value: "low", label: "Basse", emoji: "🟢" },
  { value: "medium", label: "Moyenne", emoji: "🟡" },
  { value: "high", label: "Haute", emoji: "🔴" },
];

export default function TasksForm({
  initialValues,
  onSubmit,
  submitLabel,
  loading,
}: Props) {
  const { colors } = useTheme();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [dueDate, setDueDate] = useState<Date>(
    initialValues?.dueDate
      ? new Date(initialValues.dueDate)
      : new Date(Date.now() + 86400000),
  );
  const [priority, setPriority] = useState<Priority>(
    initialValues?.priority ?? "medium",
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const titleShake = React.useRef(new Animated.Value(0)).current;

  // Sync si les initialValues changent (mode édition)
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title ?? "");
      setDescription(initialValues.description ?? "");
      setPriority(initialValues.priority ?? "medium");
      if (initialValues.dueDate) setDueDate(new Date(initialValues.dueDate));
    }
  }, [
    initialValues?.title,
    initialValues?.description,
    initialValues?.priority,
    initialValues?.dueDate,
  ]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(titleShake, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(titleShake, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(titleShake, {
        toValue: 4,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(titleShake, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      shake();
      return;
    }
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate.getTime(),
      priority,
    });
  };

  const formattedDate = dueDate.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.container}>
      {/* ── Titre ── */}
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        TITRE
      </Text>
      <Animated.View style={{ transform: [{ translateX: titleShake }] }}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.bgInput,
              borderColor: colors.borderMuted,
              color: colors.textPrimary,
            },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="Nom de la tâche..."
          placeholderTextColor={colors.textDisabled}
          maxLength={100}
          returnKeyType="next"
        />
      </Animated.View>

      {/* ── Description ── */}
      <Text
        style={[
          styles.fieldLabel,
          { color: colors.textSecondary, marginTop: spacing.lg },
        ]}
      >
        DESCRIPTION
      </Text>
      <TextInput
        style={[
          styles.input,
          styles.inputMultiline,
          {
            backgroundColor: colors.bgInput,
            borderColor: colors.borderMuted,
            color: colors.textPrimary,
          },
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Détails optionnels..."
        placeholderTextColor={colors.textDisabled}
        multiline
        maxLength={500}
        textAlignVertical="top"
      />
      <Text style={[styles.charCount, { color: colors.textDisabled }]}>
        {description.length}/500
      </Text>

      {/* ── Date d'échéance ── */}
      <Text
        style={[
          styles.fieldLabel,
          { color: colors.textSecondary, marginTop: spacing.lg },
        ]}
      >
        ÉCHÉANCE
      </Text>
      <TouchableOpacity
        style={[
          styles.dateBtn,
          {
            backgroundColor: colors.bgInput,
            borderColor: colors.borderMuted,
          },
        ]}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.75}
      >
        <Text style={styles.dateBtnIcon}>📅</Text>
        <Text style={[styles.dateBtnText, { color: colors.textPrimary }]}>
          {formattedDate}
        </Text>
        <Text style={[styles.dateBtnChevron, { color: colors.textDisabled }]}>
          ›
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={new Date()}
          onChange={(_, selected) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selected) setDueDate(selected);
          }}
          themeVariant="dark"
        />
      )}

      {/* ── Priorité ── */}
      <Text
        style={[
          styles.fieldLabel,
          { color: colors.textSecondary, marginTop: spacing.lg },
        ]}
      >
        PRIORITÉ
      </Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => {
          const cfg = colors.priority[p.value];
          const isSelected = priority === p.value;
          return (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.priorityChip,
                { borderColor: cfg.color },
                isSelected && { backgroundColor: cfg.bg },
              ]}
              onPress={() => setPriority(p.value)}
              activeOpacity={0.75}
            >
              <Text style={styles.priorityEmoji}>{p.emoji}</Text>
              <Text style={[styles.priorityLabel, { color: cfg.color }]}>
                {p.label}
              </Text>
              {isSelected && (
                <View
                  style={[styles.selectedDot, { backgroundColor: cfg.color }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Submit ── */}
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
        {loading ? (
          <ActivityIndicator color={colors.textOnAccent} />
        ) : (
          <Text style={[styles.submitText, { color: colors.textOnAccent }]}>
            {submitLabel}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.eyebrow,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...typography.body,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    ...typography.caption,
    textAlign: "right",
    marginTop: 4,
    marginRight: 4,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  dateBtnIcon: { fontSize: 16 },
  dateBtnText: { flex: 1, ...typography.body },
  dateBtnChevron: { fontSize: 22, fontWeight: "300" },
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
