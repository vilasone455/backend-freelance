import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class JobPost {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, u => u.jobPosts)
    user: User;

    @Column()
    title: string;

    @Column()
    typeJob: string;

    @Column()
    postDate: string;

    @Column()
    description: string;

    @Column({ nullable: false , default: "fix" } )
    budgetType: string;

    @Column({default: 0})
    budgetStart: number;

    @Column({default: 0})
    budgetEnd: number;

    @Column()
    skillRequires: string;
    
}