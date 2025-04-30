import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

import "../global.css";
import { Text, useColorScheme, View } from "react-native";

export default function RootLayout() {
  const theme = useColorScheme();

  return (
    <View className="flex-1">
      <View className="p-4 h-1/5 bg-[#FF8C00] flex">
        <View className="flex flex-row items-center justify-between mb-2">
          <View className="w-14 h-14 rounded-full bg-white flex justify-center items-center">
            <Text className="text-[#FF8C00]  font-bold">EF</Text>
          </View>
          <Ionicons
            name={theme === "dark" ? "sunny" : "moon"}
            size={24}
            color="#fff"
            onPress={() => {
              const newTheme = theme === "dark" ? "light" : "dark";
              console.log(`Switching to ${newTheme} theme`);
            }}
          />
        </View>
      </View>

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
    </View>
  );
}
