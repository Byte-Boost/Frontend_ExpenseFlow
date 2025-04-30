// HOME SCREEN
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <View className="w-full h-full flex flex-col gap-4 p-4 ">
        <View className="bg-[#FF8C00] w-full h-2/5 flex rounded-lg "></View>
        <View className="bg-[#FF8C00] w-full h-1/4 flex rounded-lg mt-5"></View>
        <View className="bg-[#FF8C00] w-full h-1/6 flex rounded-lg mt-12"></View>
      </View> */}
    </View>
  );
}
