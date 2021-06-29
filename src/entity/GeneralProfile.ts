import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import { Category } from "./Category";
import { Profile } from "./Profile";
import { SubCategory } from "./SubCategory";

/*
@Entity()
export class GeneralProfile {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Profile, p => p.generalProfile)
    profile : Profile;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    birthDate: string;

    @Column({default : ""})
    jobType: string;

    @Column()
    aboutMe: string;

    @Column({default : 1})
    gender: number;

}
*/