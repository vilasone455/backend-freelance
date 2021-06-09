import { User } from "src/entity/User";

export interface EditProposal{
    id ?: number
    title : string
    budgetType:number
    budget:number
    desc:string
    jobPost?:number
    status?:number
    user?:User|number
    freelance?:User|number
}