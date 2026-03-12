import { useKeyboardOffset } from "@/hooks/use-keyboard-offset";
import { radii, shadows, spacing, typography, useTheme } from "@/theme";
import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const { colors } = useTheme();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const keyboardOffset = useKeyboardOffset();

  const handleSubmit = async () => {
    const { error } = await signIn.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
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
    } else if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
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
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  if (
    signIn.status === "needs_second_factor" ||
    signIn.status === "needs_client_trust"
  ) {
    return (
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.bgBase, paddingBottom: keyboardOffset },
        ]}
      >
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
          onChangeText={setCode}
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
          onPress={() => signIn.mfa.sendEmailCode()}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
            I need a new code
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.bgBase, paddingBottom: keyboardOffset },
      ]}
    >
      <Text style={[styles.eyebrow, { color: colors.accent }]}>
        WELCOME BACK
      </Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Sign in</Text>

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
          onChangeText={setEmailAddress}
          keyboardType="email-address"
        />
        {errors.fields.identifier && (
          <Text style={[styles.error, { color: colors.error }]}>
            {errors.fields.identifier.message}
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
          secureTextEntry
          onChangeText={setPassword}
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
          Continue
        </Text>
      </Pressable>

      {/* {errors && (
        <Text style={[styles.debug, { color: colors.textMuted }]}>
          {JSON.stringify(errors, null, 2)}
        </Text>
      )} */}

      <View style={styles.linkContainer}>
        <Text style={{ color: colors.textSecondary }}>
          Don't have an account?{" "}
        </Text>
        <Link href="/sign-up">
          <Text style={[styles.link, { color: colors.accent }]}>Sign up</Text>
        </Link>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.page,
    justifyContent: "center",
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
    height: 48,
    paddingHorizontal: spacing.lg,
    ...typography.body,
    lineHeight: undefined,
    textAlignVertical: "center",
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
  debug: {
    ...typography.hint,
    marginTop: spacing.sm,
  },
});
