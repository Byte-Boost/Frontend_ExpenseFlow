import { api } from "../server";

const url = "/refund"

export default class Refund {
    public async getRefunds() {
        const response = await api.get(`${url}/`)
        return response.data
    }
    
    public async getRefundById(id: number) {
        const response = await api.get(`${url}/${id}`)
        return response.data
    }

    public async postRefund(userId: number, date: Date, type: string, value: number, attachmentRef: string, description: string, status: string) {
        await api.post(`${url}/`, {
            userId: userId,
            date: date,
            type: type,
            value: value,
            attachmentRef: attachmentRef,
            description: description,
            status: status
        })
    }
}