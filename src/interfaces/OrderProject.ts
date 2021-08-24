import { User } from "src/entity/User";

export interface OrderProject{
    id : number
    title : string
    user : User

    date : Date
}