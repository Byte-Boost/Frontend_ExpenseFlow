import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";

import "../global.css";
import { Text, View } from "react-native";
import { jwtDecode } from "jwt-decode";

type MyJwtPayload = {
  email: string;
};

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute =
    segments.length > 0 ? segments[segments.length - 1] : "index";

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>("Usuário");
  const getEmail = async () => {
    const token = await SecureStore.getItemAsync("bearerToken");
    if (token) {
      const decodedToken = jwtDecode<MyJwtPayload>(token);
      setEmail(decodedToken.email);
      setUsername(decodedToken.email.split("@")[0]);
    }
  };
  useEffect(() => {
    getEmail();
  }, []);

  const getTitle = (route: string) => {
    switch (route) {
      case "home":
        return (
          <View className="flex flex-row items-center w-full">
            <Text className="text-white text-2xl font-bold flex-1">
              Olá, {username}{" "}
            </Text>
            <View className="flex flex-row items-center justify-end">
              <Ionicons name="home" size={24} color="#fff" />
            </View>
          </View>
        );
      case "refund_list":
        return (
          <View className="flex flex-row items-center w-full">
            <Text className="text-white text-2xl font-bold flex-1">
              Lista de Reembolsos
            </Text>
            <View className="flex flex-row items-center justify-end">
              <Ionicons name="list" size={24} color="#fff" />
            </View>
          </View>
        );
      case "refund_request":
        return (
          <View className="flex flex-row items-center w-full">
            <Text className="text-white text-2xl font-bold flex-1">
              Solicitar Reembolso
            </Text>
            <View className="flex flex-row items-center justify-end">
              <Ionicons name="archive" size={24} color="#fff" />
            </View>
          </View>
        );
      default:
        return ``;
    }
  };
  const getSubtitle = (route: string) => {
    switch (route) {
      case "home":
        return (
          <View className="flex flex-row items-center ">
            <Text className="text-white text-md font-bold flex flex-row items-center">
              Bem-vindo ao nosso aplicativo{" "}
            </Text>
          </View>
        );
      case "refund_list":
        return (
          <View className="flex flex-row items-center ">
            <Text className="text-white text-md font-bold flex flex-row items-center">
              Acompanhe seus reembolsos{" "}
            </Text>
          </View>
        );
      case "refund_request":
        return (
          <View className="flex flex-row items-center ">
            <Text className="text-white text-md font-bold flex flex-row items-center">
              Escolha um projeto para solicitar reembolso{" "}
            </Text>
          </View>
        );
      default:
        return ``; // Add a name or identifier here
    }
  };
  const title = getTitle(currentRoute);
  const subtitle = getSubtitle(currentRoute);

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
            <Text className="text-[#FF8C00]  font-bold">
              {(username?.charAt(0)?.toUpperCase() || "") +
                (username?.charAt(1)?.toUpperCase() || "")}
            </Text>
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
          <Text className="text-white text-md font-bold">{subtitle}</Text>
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
