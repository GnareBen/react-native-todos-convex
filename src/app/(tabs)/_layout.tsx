import { useTheme, typography } from "@/theme";
import {NativeTabs} from "expo-router/unstable-native-tabs";
import React from "react";
import {TabBarContext} from "@/context/TabBarContext";

export default function RootLayout() {
  const { colors } = useTheme();
  const [isTabBarHidden, setIsTabBarHidden] = React.useState(false);


  return (
      <TabBarContext value={{ setIsTabBarHidden }}>
      <NativeTabs
          hidden={isTabBarHidden}
          backgroundColor={colors.bgBase}
          indicatorColor={colors.accent}
          labelStyle={{
            selected: {
              color: colors.accent,
              fontSize: typography.label.fontSize,
              fontWeight: typography.label.fontWeight,
            },
          }}
      >
        <NativeTabs.Trigger name="todo">
          <NativeTabs.Trigger.Label>Todos</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon md="task_alt" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="task">
          <NativeTabs.Trigger.Label>Tasks</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon md="task" />
        </NativeTabs.Trigger>
      </NativeTabs>
      </TabBarContext>

  );
}
