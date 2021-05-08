import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { JobPost } from "./JobPost";
import { SubCategory } from "./SubCategory";

@Entity()
export class Category {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    categoryName: string;

    @Column()
    categoryImage: string;

    @OneToMany(() => SubCategory, s => s.category)
    subCategorys : SubCategory[]

    @OneToMany(() => JobPost, s => s.category)
    jobPosts : JobPost[]

}