import api from "./server";

export default class UserService {
    public async login(email: string, password: string){
        const response = await api.post(`/user/login`, {
            email: email,
            password: password,
        })
        return response.data;
    }
}
