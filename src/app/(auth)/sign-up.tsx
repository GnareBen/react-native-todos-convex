import { radii, shadows, spacing, typography, useTheme } from "@/theme";
import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === "complete") {
      await signUp.finalize({
        // Redirect the user to the home page after signing up
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else {
      // Check why the sign-up is not complete
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgBase }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Verify your account
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the code sent to your email
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.bgInput,
              borderColor: colors.borderMuted,
              color: colors.textPrimary,
            },
          ]}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor={colors.textDisabled}
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        {errors.fields.code && (
          <Text style={[styles.error, { color: colors.error }]}>
            {errors.fields.code.message}
          </Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.accent,
              ...shadows.button(colors.accentGlow),
            },
            fetchStatus === "fetching" && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={[styles.buttonText, { color: colors.textOnAccent }]}>
            Verify
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: colors.borderMuted },
            pressed && styles.buttonPressed,
          ]}
          onPress={() => signUp.verifications.sendEmailCode()}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
            I need a new code
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>
        CREATE ACCOUNT
      </Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Sign up</Text>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Email address
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.bgInput,
              borderColor: colors.borderMuted,
              color: colors.textPrimary,
            },
          ]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor={colors.textDisabled}
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          keyboardType="email-address"
        />
        {errors.fields.emailAddress && (
          <Text style={[styles.error, { color: colors.error }]}>
            {errors.fields.emailAddress.message}
          </Text>
        )}

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Password
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.bgInput,
              borderColor: colors.borderMuted,
              color: colors.textPrimary,
            },
          ]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor={colors.textDisabled}
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        {errors.fields.password && (
          <Text style={[styles.error, { color: colors.error }]}>
            {errors.fields.password.message}
          </Text>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.accent,
            ...shadows.button(colors.accentGlow),
          },
          (!emailAddress || !password || fetchStatus === "fetching") &&
            styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === "fetching"}
      >
        <Text style={[styles.buttonText, { color: colors.textOnAccent }]}>
          Sign up
        </Text>
      </Pressable>

      <View style={styles.linkContainer}>
        <Text style={{ color: colors.textSecondary }}>
          Already have an account?{" "}
        </Text>
        <Link href="/sign-in">
          <Text style={[styles.link, { color: colors.accent }]}>Sign in</Text>
        </Link>
      </View>

      {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
      <View nativeID="clerk-captcha" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.page,
    paddingTop: spacing.xxxl * 2,
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.eyebrow,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.display,
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...typography.body,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xl,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    ...typography.button,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.button,
  },
  linkContainer: {
    flexDirection: "row",
    marginTop: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    ...typography.label,
  },
  error: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
});
