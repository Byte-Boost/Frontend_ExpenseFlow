import axios from "axios";

const axiosConfig = {
    baseURL: process.env.API_IP,
    timeout: 30000
};

export const api = axios.create(axiosConfig);
