import { api } from "../server";

const url = "user"

export default class User {
    public async registerUser(email: string, username: string, password: string) {
        await api.post(`${url}/register`, {
            email: email,
            username: username,
            password: password
        })
    }
}