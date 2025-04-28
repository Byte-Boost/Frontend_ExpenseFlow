// NAVBAR
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

import "../global.css";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const theme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "refund_request") {
            iconName = focused ? "cash" : "cash-outline";
          } else if (route.name === "account_settings") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "refund_list") {
            iconName = focused ? "list" : "list-outline";
          }

          return (
            <Ionicons
              name={iconName as any}
              size={size}
              color={focused ? "#FF8C00" : "gray"}
            />
          );
        },
        tabBarActiveTintColor: "#FF8C00",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: theme === "dark" ? "#222" : "#fff",
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: theme === "dark" ? "#444" : "#ddd",
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "bold",
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="refund_list" options={{ title: "Lista" }} />
      <Tabs.Screen name="refund_request" options={{ title: "Reembolso" }} />
      <Tabs.Screen name="account_settings" options={{ title: "Conta" }} />
    </Tabs>
  );
}
