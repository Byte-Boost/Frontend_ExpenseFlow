import  Expense  from './expense'; 

export default class Refund {
    public id: number
    public value: number | undefined
    public status: string | undefined
    public expenses: Expense[] | undefined
    public rejectReason: string | undefined

    constructor(id: number) {
        this.id = id
    }
}