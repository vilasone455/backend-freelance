import { JobPost } from "./JobPost";
import { Profile } from "./Profile";
export declare class User {
    id: number;
    userName: string;
    userEmail: string;
    userPassword: string;
    profile: Profile;
    jobPosts: JobPost[];
}
