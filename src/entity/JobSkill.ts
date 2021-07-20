import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { JobPost } from "./JobPost";

@Entity()
export class JobSkill {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default : ""})
    skillName: string;
    
    @ManyToOne(() => JobPost, j =>j.skillSet)
    jobPost: JobPost;

}