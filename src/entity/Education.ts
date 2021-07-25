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

    @Column({default : ""})
    about: string;

    @Column({nullable : true})
    start: Date;

    @Column({nullable : true})
    end: Date;
}