import { Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from 'expo-secure-store';
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
      <Text>Edit app/index.tsx to edit this screen.</Text>
            <TouchableOpacity
              className="bg-blue-500 w-full p-3 rounded-lg"
              onPress={() => { 
                SecureStore.deleteItemAsync('userLoggedIn');
                router.replace('/');
              }}
            >   
              <Text className="text-white text-center font-bold">Log-out</Text>
            </TouchableOpacity>
    </View>
  );
}
