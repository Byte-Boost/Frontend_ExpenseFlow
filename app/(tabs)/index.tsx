import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import { useAlert } from "@/hooks/useAlert";

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const { showAlert, AlertComponent } = useAlert();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userLoggedIn = await SecureStore.getItemAsync('userLoggedIn');
      console.log(userLoggedIn);
      setIsLoggedIn(userLoggedIn === 'true');
    };

    checkLoginStatus();
  }, []);


  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/home');
    }
  }, [isLoggedIn, router]);

  const validateEmail = (email: string) => {
    const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return regex.test(email);
  };

  const handleLogin = async () => {

    if (!email || !password) {
      showAlert("Oops!", "Por Favor preencha ambos os campos", "error");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor inserir um e-mail válido');
      return;
    }

    console.log('Login attempt:', email, password);
    await SecureStore.setItemAsync('userLoggedIn', 'true');
    router.push('/home');
  };

  return (
    <View className="flex-1 justify-center items-center  p-6"
    >
      <LinearGradient colors={['#f47f1f', '#f25f22', '#ea2223']} className=" absolute left-0 right-0 top-0 h-screen opacity-" />
      <Text className="text-2xl font-extrabold mb-4 text-white">Login</Text>

      <View className="w-full h-fit p-10 bg-white rounded-3xl flex flex-col gap-5">

        <TextInput
          className={`w-full p-3 border border-black mb-3 bg-white ${emailError? 'border-red-500': ''}`}
          placeholder="E-mail"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {AlertComponent}
        {emailError && (
          <Text className="text-red-500 text-md mb-3">{emailError}</Text>
        )}
        <View className="flex flex-row items-center ">
          <TextInput
            className="w-full border border-black  px-4 py-3 pr-12 text-base"
            placeholder="Senha" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
      <TouchableOpacity 
      onPress={() => setShowPassword(!showPassword)} 
      className="absolute right-4 top-1/2 -translate-y-1/2 ">
        <Feather name={showPassword ? "eye" : "eye-off"} size={22} color="#555" />
      </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="bg-[#f47f1f] w-full p-3 rounded-lg"
          onPress={handleLogin}
        >
          <Text className="text-white text-center font-bold">Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
