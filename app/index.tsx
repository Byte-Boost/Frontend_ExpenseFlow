import { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const { showAlert, AlertComponent } = useAlert();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userLoggedIn = await SecureStore.getItemAsync("userLoggedIn");
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
      showAlert("Oops!", "Por favor preencha ambos os campos", "error");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Por favor inserir um e-mail válido");
      return;
    }

    let response = await _userService.login(email, password).catch(() => {
      showAlert(
        "Oops!",
        "Ocorreu um erro de conexão. Por favor, tente novamente mais tarde.",
        "error"
      );
    });
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
    <LinearGradient
      colors={["#FF8C00", "#f97316", "#fbbf24"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <View className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg">
        <Image
          source={require("../assets/images/icon.png")}
          className="w-32 h-32 mb-6 self-center"
        />
        <Text className="text-2xl font-semibold text-center mb-6">
          Faça seu login
        </Text>

        {/* Email input */}
        <TextInput
          className={`h-16 px-4 mb-4 text-lg border rounded-md ${
            emailError ? "border-red-500" : "border-gray-300"
          } bg-gray-100 text-black`}
          placeholder="E-mail"
          placeholderTextColor="#666"
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
          <Text className="text-red-500 text-sm mb-3">{emailError}</Text>
        )}

        {/* Password input */}
        <View className="relative">
          <TextInput
            className="h-14 px-4 mb-6 text-lg border rounded-md bg-gray-100 text-black border-gray-300"
            placeholder="Senha"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/3 -translate-y-1/2"
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleLogin}
          className="w-full h-16 bg-orange-500 rounded-md justify-center items-center mb-4"
        >
          <Text className="text-white text-lg font-bold">Entrar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
