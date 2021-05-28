import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, UpdateDateColumn, CreateDateColumn} from "typeorm";

import { JobPost } from "./JobPost";
import { User } from "./User";

@Entity()
export class Proposal {

    @PrimaryGeneratedColumn()
    id : number;

    @Column({default:""})
    title : string

    @Column()
    desc : string

    @Column({default : 1})
    budgetType : number

    @Column({default : 0})
    budget : number

    @Column({default : false})
    freelanceAccept : boolean
    
    @Column({default : true})
    userAccept : boolean

    @Column({default : 1})
    status : number

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date;

    @ManyToOne(()=> User , u=>u.proposals)
    user : User

    @ManyToOne(()=> User , u=>u.proposals)
    freelance : User

    @ManyToOne(() => JobPost , j=>j.proposals , {cascade : true})
    jobPost : JobPost
 
}