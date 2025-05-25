import api from "./server";

export default class ProjectService {
  // NEED TEST
  public async getProjects(
    page: number = 1,
    limit: number = 15,
    arrayOnly: boolean = false
  ) {
    const response = await api.get(`/project/`, {
      params: {
        page: page,
        limit: limit,
      },
    });
    return arrayOnly ? response.data.projects : response.data;
  }

  // NEED TEST
  public async getProjectById(id: number) {
    const response = await api.get(`/project/${id}`);
    return response.data;
  }
}
