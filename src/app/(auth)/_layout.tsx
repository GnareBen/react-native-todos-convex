import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function Layout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  // Already signed in → redirect to home
  if (isSignedIn) {
    return <Redirect href="/(home)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
