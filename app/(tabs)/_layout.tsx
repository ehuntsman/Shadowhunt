import { Tabs } from "expo-router";
import { Crosshair, Home, Book } from "lucide-react-native";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: Platform.select({
          web: { overflow: "visible" },
          default: {},
        }),
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hunt",
          tabBarIcon: ({ color }) => <Crosshair size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Bunker",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Black Book",
          tabBarIcon: ({ color }) => <Book size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
