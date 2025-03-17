// ACCOUNT SETTINGS SCREEN
import { Button, Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";


export default function AccountSettings() {
    const router = useRouter();
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text>Placeholder Log-Out button here</Text>
            <TouchableOpacity
                className=" p-3 rounded-lg"
                style={{ backgroundColor: "red" }}
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
