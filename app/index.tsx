import { useEffect, useState } from "react";
import {
  Alert,
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
    <View className="flex-1 justify-center items-center p-6">
      <LinearGradient
        colors={["#f47f1f", "#f25f22", "#ea2223"]}
        className="absolute left-0 right-0 top-0 h-screen"
      />

      <Text className="text-2xl font-extrabold mb-4 text-white">Login</Text>

      <View
        className={`w-full h-fit p-10 rounded-3xl flex flex-col gap-5 
        ${
          theme === "dark"
            ? "bg-gray-900 border border-gray-700"
            : "bg-white shadow-lg"
        }`}
      >
        <TextInput
          className={`w-full p-3 rounded-lg border ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-gray-100 text-black border-gray-300"
          } ${emailError ? "border-red-500" : ""}`}
          placeholder="E-mail"
          placeholderTextColor={theme === "dark" ? "#bbb" : "#666"}
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
            className={`w-full p-3 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-600"
                : "bg-gray-100 text-black border-gray-300"
            }`}
            placeholder="Senha"
            placeholderTextColor={theme === "dark" ? "#bbb" : "#666"}
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
              color={theme === "dark" ? "#aaa" : "#555"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="w-full p-3 rounded-lg"
          style={{ backgroundColor: "#f47f1f" }}
          onPress={handleLogin}
        >
          <Text className="text-white text-center font-bold">Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
