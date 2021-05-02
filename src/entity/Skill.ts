import {Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class Skill {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Profile, p => p.skills)
    profile: Profile;

    @Column()
    skillName: string;

    @Column()
    skillClass: string;

    @Column()
    level: string;

}