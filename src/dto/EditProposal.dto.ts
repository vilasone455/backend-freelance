import { User } from "src/entity/User";

export interface EditProposal{
    id ?: number
    title : string
    budgetType:number
    budget:number
    desc:string
    jobPost?:number
    user?:User
    freelance?:User|number
}