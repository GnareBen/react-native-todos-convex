import { useAuth } from "@clerk/expo";
import { Redirect, useFocusEffect } from "expo-router";
import { use } from 'react';

import { TabBarContext } from '@/context/TabBarContext';


export default function RootIndex() {

  const { setIsTabBarHidden } = use(TabBarContext);

  useFocusEffect(() => {
    setIsTabBarHidden(true);
    return () => setIsTabBarHidden(false);
  });

  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <Redirect href="/(tabs)/todo" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
