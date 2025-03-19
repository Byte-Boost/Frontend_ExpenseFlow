// ACCOUNT SETTINGS SCREEN
import { Image, Button, Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
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
       
            <View className="h-1/4" 
                style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",}}>

            <View style={{backgroundColor:"#FF8C00"}} className=" h-36 rounded-full justify-center items-center w-36 mt-6" ><Ionicons name="person" size={70}/></View>

            <Text className="mt-2 mb-3 text-gray text-lg">EMAIL</Text>
            </View>
            
            <View className="h-3/4">
            {/* <TouchableOpacity
                className=" p-4  border-b-2 rounded-lg "
                onPress={() => {
                    SecureStore.deleteItemAsync('');
                    router.replace('/');
                }}
                >
                <Text className="text-gray  ">Dados Pessoais</Text>                
            </TouchableOpacity>
            <TouchableOpacity
                className=" p-4 border-b-2 rounded-lg "
                onPress={() => {
                    SecureStore.deleteItemAsync('');
                    router.replace('/');
                }}
                >
                <Text className="text-gray  ">Central de Ajuda</Text>                
            </TouchableOpacity>
            <TouchableOpacity
                className=" p-4 border-b-2 rounded-lg "
                onPress={() => {
                    SecureStore.deleteItemAsync('');
                    router.replace('/');
                }}
                >
                <Text className="text-gray  ">Autorizações</Text>                
            </TouchableOpacity>
            <TouchableOpacity
                className=" p-4 border-b-2 rounded-lg "
                onPress={() => {
                    SecureStore.deleteItemAsync('');
                    router.replace('/');
                }}
                >
                <Text className="text-gray  ">Sobre o Aplicativo</Text>                
            </TouchableOpacity> */}
            <TouchableOpacity
                className=" p-4 pr-96 border-b-2 rounded-lg "
                onPress={() => {
                    SecureStore.deleteItemAsync('userLoggedIn');
                    router.replace('/');
                }}
                >
                <Text className="text-red-700  font-bold">Log-out</Text>
            </TouchableOpacity>
            
                </View>
        </View>
    );
}
