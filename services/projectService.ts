import api from "./server";

export default class ProjectService {
    // NEED TEST
    public async getProjects() {
        const response = await api.get(`/project/`)
        return response.data
    }
    
    // NEED TEST
    public async getProjectById(id: number) {
        const response = await api.get(`/project/${id}`)
        return response.data
    }
}
