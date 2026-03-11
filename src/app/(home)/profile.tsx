import { radii, shadows, spacing, typography, useTheme } from "@/theme";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const initials = user
    ? `${(user.firstName?.[0] ?? "").toUpperCase()}${(user.lastName?.[0] ?? "").toUpperCase()}` ||
      user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ||
      "?"
    : "?";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBase }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bgBase}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.textSecondary }]}>
            ←
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Profil
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={[styles.avatarLarge, { borderColor: colors.accent }]}
            />
          ) : (
            <View
              style={[
                styles.avatarLarge,
                styles.avatarFallbackLarge,
                {
                  backgroundColor: colors.accentMuted,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Text
                style={[styles.avatarInitialsLarge, { color: colors.accent }]}
              >
                {initials}
              </Text>
            </View>
          )}
          <Text style={[styles.displayName, { color: colors.textPrimary }]}>
            {user?.fullName || "Utilisateur"}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.emailAddresses[0]?.emailAddress}
          </Text>
        </View>

        {/* Info card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgSurface, ...shadows.card },
          ]}
        >
          <InfoRow
            label="Prénom"
            value={user?.firstName || "—"}
            colors={colors}
          />
          <View
            style={[styles.divider, { backgroundColor: colors.borderSubtle }]}
          />
          <InfoRow label="Nom" value={user?.lastName || "—"} colors={colors} />
          <View
            style={[styles.divider, { backgroundColor: colors.borderSubtle }]}
          />
          <InfoRow
            label="Email"
            value={user?.emailAddresses[0]?.emailAddress || "—"}
            colors={colors}
          />
          <View
            style={[styles.divider, { backgroundColor: colors.borderSubtle }]}
          />
          <InfoRow
            label="Membre depuis"
            value={
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"
            }
            colors={colors}
          />
        </View>

        {/* Sign out */}
        <Pressable
          onPress={() => signOut()}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: colors.errorMuted,
              borderColor: colors.errorBorder,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.signOutText, { color: colors.error }]}>
            Se déconnecter
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <Text
        style={[styles.infoValue, { color: colors.textPrimary }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { fontSize: 24 },
  headerTitle: { ...typography.title },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    marginBottom: spacing.sm,
  },
  avatarFallbackLarge: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialsLarge: {
    fontSize: 36,
    fontWeight: "800",
  },
  displayName: { ...typography.title, textAlign: "center" },
  email: { ...typography.body, textAlign: "center" },
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { ...typography.label },
  infoValue: { ...typography.body, flexShrink: 1, textAlign: "right" },
  signOutButton: {
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
  },
  signOutText: { ...typography.button },
});
