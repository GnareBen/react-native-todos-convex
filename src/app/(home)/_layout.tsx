import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import React from "react";
import { useColorScheme } from "react-native";

import { useAuth } from "@clerk/expo";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Redirect, Stack } from "expo-router";

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string,
);

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ConvexProvider client={convex}>
        <Stack screenOptions={{ headerShown: false }} />
      </ConvexProvider>
    </ThemeProvider>
  );
}
