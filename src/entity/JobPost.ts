import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn} from "typeorm";
import { Category } from "./Category";
import { JobSkill } from "./JobSkill";

import { Proposal } from "./Proposal";

import { SubCategory } from "./SubCategory";
import { User } from "./User";

@Entity()
export class JobPost {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, u => u.jobPosts)
    user: User;

    @Column()
    title: string;

    @CreateDateColumn()
    createdDate: Date;

    @Column({default : 1})
    status : number

    @Column({default : 1})
    jobType: number;

    @Column({default : "1"})
    location: string;

    @Column({default : 1})
    experienceRequire: number;

    @ManyToOne(() => Category, c=>c.jobPosts)
    category: Category;

    @ManyToOne(() => SubCategory, s=>s.jobPosts)
    subCategory: SubCategory;

    @OneToMany(() => Proposal , p => p.jobPost )
    proposals : Proposal[]

    @OneToMany(() => JobSkill , j => j.jobPost )
    skillSet : JobSkill[]

    @Column()
    description: string;

    @Column({ default: 1 } )
    budgetType: number;

    @Column({default: 0})
    budgetStart: number;

    @Column({default: 0})
    budgetEnd: number;

    @Column()
    skillRequires: string;

    
}

export interface SimilarJob {
    id : number
    title : string
}