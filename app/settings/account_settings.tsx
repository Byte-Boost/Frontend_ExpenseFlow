import { Ionicons } from "@expo/vector-icons";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

type MyJwtPayload = {
  email: string;
};

export default function AccountSettings() {
  const router = useRouter();
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
  const handleLogout = async () => {
    Alert.alert("Sair", "Você tem certeza que deseja sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        onPress: async () => {
          await SecureStore.deleteItemAsync("userLoggedIn");
          router.replace("/");
        },
      },
    ]);
  };
  const handleBack = () => {
    router.back();
  };
  return (
    <View className="flex-1 bg-white">
      <View className="p-4 flex-row items-center justify-between bg-[#FF8C00]">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Configurações</Text>
        <View className="w-8" />
      </View>

      {/* Profile Section */}
      <View className="flex-1 justify-center items-center mt-6">
        <View className="bg-[#FF8C00] h-36 w-36 rounded-full justify-center items-center">
          <Text className="text-white  font-bold text-4xl text-center place-content-center items-center">
            {(username?.charAt(0)?.toUpperCase() ?? "") +
              (username?.charAt(1)?.toUpperCase() ?? "")}
          </Text>
        </View>
        <Text className="mt-3 text-lg font-semibold text-gray-700">
          {email}
        </Text>
      </View>

      {/* About */}
      <View className="flex-1 pt-7 px-6">
        {/* About Button */}
        <TouchableOpacity
          onPress={() => router.push("/settings/about")}
          activeOpacity={0.85}
          className="flex-row items-center justify-center p-5 rounded-xl border-2 border-[#FF8C00] bg-[#FF8C00] mb-4 shadow"
        >
          <Ionicons
            name="information-circle-outline"
            size={33}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-bold text-xl text-center">
            Sobre o Aplicativo
          </Text>
        </TouchableOpacity>

        {/* Log-out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          className="flex-row items-center justify-center p-5 rounded-xl border-2 border-red-600 bg-red-500 shadow"
        >
          <Ionicons
            name="exit-outline"
            size={33}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-bold text-xl text-center">Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
