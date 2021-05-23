import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn} from "typeorm";
import { Address } from "./Address";
import { Education } from "./Education";
import { GeneralProfile } from "./GeneralProfile";
import { Language } from "./Language";
import { Portfilio } from "./Portfilio";
import { Skill } from "./Skill";
import { User } from "./User";
import { WorkEx } from "./WorkEx";

@Entity()
export class Profile {

    @PrimaryGeneratedColumn()
    id: number;
    @OneToOne(() => GeneralProfile , g=>g.profile)
    @JoinColumn()
    generalProfile: GeneralProfile;

    @OneToOne(() => Address)
    @JoinColumn()
    address: Address;

    @Column({default : ""})
    skills : string

    @OneToMany(() => Education, e => e.profile)
    educations: Education[];

    @OneToMany(() => WorkEx, w => w.profile)
    workExs: WorkEx[];

    @OneToMany(() => Portfilio, w => w.profile)
    portfilios: Portfilio[];

    @OneToMany(() => Language, l => l.profile)
    languages: Language[];

}