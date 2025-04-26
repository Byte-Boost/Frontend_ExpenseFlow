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
      {/* <Text>Home without anything in it for now</Text> */}
    </View>
  );
}
