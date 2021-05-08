import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn} from "typeorm";
import { Category } from "./Category";
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

    @ManyToOne(() => Category, c=>c.jobPosts)
    category: Category;

    @ManyToOne(() => SubCategory, s=>s.jobPosts)
    subCategory: SubCategory;

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