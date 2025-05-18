import { Ionicons } from "@expo/vector-icons";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function AccountSettings() {
  const router = useRouter();
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
    <View className="flex-1 bg-[#F5F5F5]">
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
          <Ionicons name="person" size={70} color="white" />
        </View>
        <Text className="mt-3 text-lg font-semibold text-gray-700">EMAIL</Text>
      </View>

      {/* Settings Options */}
      <View className="flex-1 pt-7 px-6">
        <TouchableOpacity
          className="p-5 bg-white border-b-2 border-[#FF8C00] rounded-lg shadow-lg"
          onPress={() => {
            // router.push("/settings/personal_data");
          }}
        >
          <Text className="text-[#333333] font-medium text-lg">
            Dados Pessoais
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-5 bg-white border-b-2 border-[#FF8C00] rounded-lg shadow-lg mt-3"
          onPress={() => {
            // router.push("/settings/about");
          }}
        >
          <Text className="text-[#333333] font-medium text-lg">
            Sobre o Aplicativo
          </Text>
        </TouchableOpacity>

        {/* Log-out Button */}
        <TouchableOpacity
          className="p-5 bg-white border-b-2 border-red-700 rounded-lg shadow-lg mt-6"
          onPress={handleLogout}
        >
          <Text className="text-red-700 font-bold text-lg">Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
