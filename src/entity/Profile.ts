import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn} from "typeorm";
import { Address } from "./Address";
import { Education } from "./Education";
import { GeneralProfile } from "./GeneralProfile";
import { Portfilio } from "./Portfilio";
import { Skill } from "./Skill";
import { WorkEx } from "./WorkEx";

@Entity()
export class Profile {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => GeneralProfile)
    @JoinColumn()
    generalProfile: GeneralProfile;

    @OneToOne(() => Address)
    @JoinColumn()
    address: Address;

    @OneToMany(() => Education, e => e.profile)
    educations: Education[];

    @OneToMany(() => WorkEx, w => w.profile)
    workExs: WorkEx[];

    @OneToMany(() => Portfilio, w => w.profile)
    portfilios: Portfilio[];

    @OneToMany(() => Skill, s => s.profile)
    skills: Skill[];
}