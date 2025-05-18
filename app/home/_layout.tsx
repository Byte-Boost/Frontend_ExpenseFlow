import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

import "../global.css";
import { Text, View } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute =
    segments.length > 0 ? segments[segments.length - 1] : "index";

  const getTitle = (route: string) => {
    switch (route) {
      case "home":
        return "Olá, Usuário";
      case "refund_list":
        return "Lista de Reembolsos";
      case "refund_request":
        return "Pedido de Reembolso";
      default:
        return "Bem-Vindo ao ExpenseFlow";
    }
  };
  const title = getTitle(currentRoute);

  return (
    <View className="flex-1">
      <View className="p-4 h-1/5 bg-[#FF8C00] flex ">
        {/* Header with logo and theme toggle button */}
        <View className="flex flex-row items-center justify-between mb-2 pt-6">
          <View
            className="w-14 h-14 rounded-full bg-white flex justify-center items-center"
            onTouchStart={() => {
              router.push("/settings/account_settings");
            }}
          >
            <Text className="text-[#FF8C00]  font-bold">EF</Text>
          </View>
          <View className="flex flex-row items-end justify-end gap-5 w-1/2">
            {/* <Ionicons
              name={theme === "dark" ? "sunny" : "moon"}
              size={24}
              color="#fff"
              onPress={() => {
                const newTheme = theme === "dark" ? "light" : "dark";
                console.log(`Switching to ${newTheme} theme`);
              }}
            /> */}
            <Ionicons name="notifications" size={24} color="#fff" />
          </View>
        </View>
        {/* Title and subtitle */}
        <View className="flex flex-col items-start justify-between mb-2">
          <Text className="text-white text-2xl font-bold">{title}</Text>
          <Text className="text-white text-md font-bold">{title}</Text>
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
            backgroundColor: "#fff",
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: "#ddd",
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
      </Tabs>
    </View>
  );
}
