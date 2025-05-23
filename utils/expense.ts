type ExpenseType = "value" | "quantity"

export default class Expense {
    public id: number
    public userId: number | undefined
    public date: Date | undefined
    public type: ExpenseType | undefined
    public quantityType: string | undefined
    public value: number | undefined
    public attachment: string | undefined
    public description: string | undefined
    public refundId: number | undefined


    constructor(id: number) {
        this.id = id
    }
}
