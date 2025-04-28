import api from "./server";

export default class RefundService {
  public async getRefunds(displayMonth: string = "", displayYear: string = "") {
    const response = await api.get(
      `/refund?periodStart=${displayYear}-${displayMonth
        .toString()
        .padStart(2, "0")}-01&periodEnd=${displayYear}-${displayMonth
        .toString()
        .padStart(2, "0")}-31`
    );
    return response.data;
  }

  public async getRefundById(id: number) {
    const response = await api.get(`/refund/${id}`);
    return response.data;
  }

  public async createRefund(projectId: number) {
    try {
      const response = await api.post(`/refund/${projectId}`);
      return response.data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  public async getRefundByStatus(status: string) {
    const response = await api.get(`/refund/${status}`);
    return response.data;
  }

  public async closeRefund(id: number) {
    return await api.patch(`/refund/${id}/close`);
  }

  public async deleteRefund(id: number) {
    try {
      const response = await api.delete(`/refund/${id}`);
      return response.status;
    } catch (err) {
      console.error("Error deleting refund:", err);
      throw err;
    }
  }

  public async createExpense(
    refundId: number,
    type: string,
    value: number,
    description: string | undefined,
    file: string,
    quantityType?: string
  ): Promise<number> {
    const response = await api.post(`/refund/expense`, {
      refundId: refundId,
      type: type,
      quantityType: quantityType,
      value: value,
      description: description,
      file: file,
    });
    return response.data;
  }
}
