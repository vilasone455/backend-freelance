import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne} from "typeorm";

import { JobPost } from "./JobPost";
import { User } from "./User";

@Entity()
export class Proposal {

    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    desc : string

    @Column()
    review : string

    @ManyToOne(()=> User , u=>u.proposals)
    user : User

    @ManyToOne(() => JobPost , j=>j.proposals , {cascade : true})
    jobPost : JobPost
 
}