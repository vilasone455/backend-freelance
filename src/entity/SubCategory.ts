import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm";
import { Category } from "./Category";
import { JobPost } from "./JobPost";

@Entity()
export class SubCategory {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    subCategoryName: string;

    @ManyToOne(() => Category , c=>c.subCategorys)
    category : Category

    @OneToMany(() => JobPost, s => s.subCategory)
    jobPosts : JobPost[]

}