import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import { Address } from "./Address";
import { Category } from "./Category";
import { Education } from "./Education";
//import { GeneralProfile } from "./GeneralProfile";
import { Language } from "./Language";
import { Portfilio } from "./Portfilio";
import { Skill } from "./Skill";
import { SubCategory } from "./SubCategory";
import { User } from "./User";
import { WorkEx } from "./WorkEx";

@Entity()
export class Profile {

    @PrimaryGeneratedColumn()
    id: number;
    

    @Column({default : ""})
    firstName: string;

    @Column({default : ""})
    lastName: string;

    @Column({default : () => "CURRENT_TIMESTAMP(6)"})
    birthDate: Date;

    @Column({default : ""})
    jobType: string;

    @Column({default : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam"})
    aboutMe: string;

    @Column({default : 1})
    gender: number;

    @ManyToOne(() => Category)
    @JoinColumn()
    category : Category;

    @ManyToOne(() => SubCategory)
    @JoinColumn()
    subCategory : SubCategory;

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