import "@/polyfills";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { Slot, SplashScreen } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
  throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY manquante dans .env");
}

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

SplashScreen.preventAutoHideAsync();

function useAuthForConvex() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      try {
        return await getToken({
          template: "convex",
          skipCache: forceRefreshToken,
        });
      } catch {
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSignedIn],
  );

  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: isSignedIn ?? false,
      fetchAccessToken,
    }),
    [isLoaded, isSignedIn, fetchAccessToken],
  );
}

function InitialLayout() {
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) SplashScreen.hideAsync();
  }, [isLoaded]);

  if (!isLoaded) return null;

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthForConvex}>
        <InitialLayout />
      </ConvexProviderWithAuth>
    </ClerkProvider>
  );
}
