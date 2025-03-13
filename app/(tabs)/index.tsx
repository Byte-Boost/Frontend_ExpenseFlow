import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null); 

  const router = useRouter();

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
      Alert.alert('Erro de Validação', 'Por favor preencha ambos os campos');
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
      <LinearGradient colors={['#FFFF','#FFFF','#FFFF']} className=" absolute left-0 right-0 top-0 h-screen opacity-" />
      <Text className="text-2xl font-bold mb-4">Login</Text>

      <TextInput
        className="w-full p-3 border border-gray-300 mb-3 bg-white"
        placeholder="E-mail"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError && (
        <Text className="text-red-500 text-sm mb-3">{emailError}</Text>
      )}
      <TextInput
        className="w-full p-3 border border-gray-300 mb-3 bg-white"
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
        
      <TouchableOpacity
        className="bg-blue-500 w-full p-3 rounded-lg"
        onPress={handleLogin}
      >
        <Text className="text-white text-center font-bold">Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}
