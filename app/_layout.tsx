import { Tabs } from "expo-router";
import { BookOpen, ScrollText } from "lucide-react-native";

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#1E40AF" , headerShown:false}} >
      <Tabs.Screen
        name="tabs/index"
        options={{
          title: "Words",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="tabs/summary"
        options={{
          title: "Summary",
          tabBarIcon: ({ color, size }) => <ScrollText color={color} size={size} />
        }}
      />
    </Tabs>
  );
}