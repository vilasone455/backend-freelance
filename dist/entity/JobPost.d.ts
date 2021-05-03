import { User } from "./User";
export declare class JobPost {
    id: number;
    user: User;
    title: string;
    typeJob: string;
    postDate: string;
    description: string;
    budgetType: string;
    budgetStart: number;
    budgetEnd: number;
    skillRequires: string;
}
