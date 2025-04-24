import api from "./server";

export default class ProjectService {
    // NEED TEST
    public async getProjectByUser(user: string) {
        const response = await api.get(`/project/${user}`)
        return response.data
    }
    
    // NEED TEST
    public async getProjectById(id: number) {
        const response = await api.get(`/project/${id}`)
        return response.data
    }
}
