import api from "./server";

export default class ExpenseService {
  public async getExpenseById(id: number) {
    const response = await api.get(`/refund/expense/${id}`);
    return response.data;
  }
}
