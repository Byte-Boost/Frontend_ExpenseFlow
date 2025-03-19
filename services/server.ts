import axios from "axios";

const localIP = "192.168.15.7" 
// How to use this localIP
// If you're using the android emulator, set localIP to "10.0.2.2"
// If you're using your own phone, set localIP to your machine's ip address (on windows use "ipconfig" to find it)

export const api = axios.create({
    baseURL: `http://${localIP}:3200`
})
