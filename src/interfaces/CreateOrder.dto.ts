import { Proposal } from "src/entity/Proposal";

export interface CreateOrder{
    orderStatus : number
    proposal : Proposal
}