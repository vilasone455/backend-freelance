import {Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class Skill {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Profile, p => p.skillSet)
    profile : Profile

    @Column({default : ""})
    skillName: string;

    @Column({default : 1})
    level: string;

}