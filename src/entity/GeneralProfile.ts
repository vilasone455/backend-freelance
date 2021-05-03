import {Entity, Column, PrimaryGeneratedColumn, OneToOne} from "typeorm";
import { Profile } from "./Profile";

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

    @Column()
    gender: string;

    @Column()
    photo: string;
}