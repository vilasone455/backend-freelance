import { Address } from "./Address";
import { Education } from "./Education";
import { GeneralProfile } from "./GeneralProfile";
import { Portfilio } from "./Portfilio";
import { Skill } from "./Skill";
import { WorkEx } from "./WorkEx";
export declare class Profile {
    id: number;
    generalProfile: GeneralProfile;
    address: Address;
    educations: Education[];
    workExs: WorkEx[];
    portfilios: Portfilio[];
    skills: Skill[];
}
