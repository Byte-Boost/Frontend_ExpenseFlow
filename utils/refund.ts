export default class Refund {
    public id: number
    public type: string | undefined
    public value: number | undefined
    public description: string | undefined
    public file: string | undefined
    public status: string | undefined

    constructor(id: number) {
        this.id = id
    }
}