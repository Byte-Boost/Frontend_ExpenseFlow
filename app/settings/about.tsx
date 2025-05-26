import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View, Linking } from "react-native";
import { useRouter } from "expo-router";

export default function About() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      {/* Header */}
      <View className="p-4 flex-row items-center justify-between bg-[#FF8C00]">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">
          Sobre o Aplicativo
        </Text>
        <View className="w-8" />
      </View>
      <View className="flex-1 justify-center items-center place-content-center mt-6">
        {/* App Icon */}
        <View className="w-full place-content-center items-center text-center ">
          <Image
            source={require("../../assets/images/icon.png")}
            className="w-32 h-32 mb-6 self-center"
          />
          <Text className="text-2xl font-semibold text-center mb-6">
            ExpenseFlow
          </Text>
        </View>
        {/* Info and Links */}
        <View className="border-b border-gray-300  h-0.5 w-full" />

        <View className="flex-1 pt-7 px-6">
          <Text className="text-center text-gray-700 mb-2">Versão 1.0.3</Text>
          <Text className="text-center text-gray-600 mb-4">
            ExpenseFlow é um aplicativo para gestão e reembolso de despesas.
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://github.com/byte-boost/expenseflow")
            }
            className="mb-2 bg-[#FF8C00] p-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold">
              Ver no GitHub
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://byte-boost-team-website.vercel.app/")
            }
            className="mb-2 bg-[#FF8C00] p-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold">
              Site da Equipe
            </Text>
          </TouchableOpacity>
          <Text className="text-center text-gray-400 mt-8">
            © 2025 Byte Boost Team
          </Text>
        </View>
      </View>
    </View>
  );
}
