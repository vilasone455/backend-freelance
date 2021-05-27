import { User } from "src/entity/User";

export interface EditProposal{
    id ?: number
    budgetType:number
    budget:number
    desc:string
    jobPost?:number
    user?:User
    freelance?:User|number
}