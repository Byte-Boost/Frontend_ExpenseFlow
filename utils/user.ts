export default class User {
    public id: number
    public email: string | undefined
    public password: string | undefined
    public admin: boolean | undefined

    constructor(id: number) {
        this.id = id
    }
}