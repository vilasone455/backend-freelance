import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class Education {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Profile, p => p.educations)
    profile: Profile;

    @Column()
    schoolName: string;

    @Column()
    degree: string;

    @Column()
    start: string;

    @Column()
    end: string;
}