import axios from "axios";
import { jwtDecode, JwtPayload } from 'jwt-decode'; 
import * as SecureStore from 'expo-secure-store';

interface MyJwtPayload extends JwtPayload {
  id: string,
  email: string
}
const axiosConfig = {
    baseURL: process.env.EXPO_PUBLIC_API_IP,
    timeout: 30000
};
const api = axios.create(axiosConfig);

// Add a request interceptor
api.interceptors.request.use(async (config) => {
    const userToken = await SecureStore.getItemAsync("bearerToken"); 

    // Get the authorization value
    const authorizationValue = 'bear ' + userToken;
  
    // Add the Authorization header
    config.headers.Authorization = authorizationValue;
  
    return config;
  });

export default api;