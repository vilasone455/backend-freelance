import {Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class Skill {

    @PrimaryGeneratedColumn()
    id: number;


    @Column()
    skillName: string;

    @Column()
    skillClass: string;

    @Column()
    level: string;

}