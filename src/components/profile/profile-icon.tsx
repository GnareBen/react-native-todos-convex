import { spacing, typography, useTheme } from "@/theme";
import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ProfileIcon = () => {
  const { user } = useUser();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => router.push("/(profile)")}
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
          <Text style={[styles.avatarInitials, { color: colors.accent }]}>
            {(user?.firstName?.[0] ?? "").toUpperCase() || "?"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ProfileIcon;

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
});
