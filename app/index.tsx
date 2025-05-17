import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import { useAlert } from "@/hooks/useAlert";
import UserService from "@/services/userService";

const _userService = new UserService();

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const theme = useColorScheme();

  const { showAlert, AlertComponent } = useAlert();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userLoggedIn = await SecureStore.getItemAsync("userLoggedIn");
      console.log(userLoggedIn);
      setIsLoggedIn(userLoggedIn === "true");
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/home");
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
      setEmailError("Por favor inserir um e-mail válido");
      return;
    }
    let response = await _userService.login(email, password);
    if (response.token === undefined) {
      showAlert("Oops!", response.error, "error");
      return;
    } else {
      await SecureStore.setItemAsync("bearerToken", response.token);
      await SecureStore.setItemAsync("userLoggedIn", "true");
      router.push("/home");
    }
  };

  return (
    <View className="flex-1  items-center  bg-white">
      <Image
        source={require("../assets/images/icon.png")}
        className="w-32 h-32 mt-10 mb-5"
      />
      <Text className="text-4xl font-extrabold mb-4  ">Login</Text>

      <View className={`w-full h-fit p-10  flex flex-col gap-5`}>
        <TextInput
          className={`w-full h-16 text-[1.35rem]   p-3 border ${"bg-gray-100 text-black border-gray-300"} ${
            emailError ? "border-red-500" : ""
          }`}
          placeholder="E-mail"
          placeholderTextColor={"#666"}
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

        <View className="relative">
          <TextInput
            className={`w-full p-3 h-14 text-[1.35rem]  border ${"bg-gray-100 text-black border-gray-300"}`}
            placeholder="Senha"
            placeholderTextColor={"#666"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={22}
              color={"#555"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="w-full p-3 bg-[#f47f1f] h-16 justify-center"
          onPress={handleLogin}
        >
          <Text className="text-white text-center text-[1.35rem] font-bold">
            Entrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
