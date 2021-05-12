import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import { Category } from "./Category";
import { Profile } from "./Profile";
import { SubCategory } from "./SubCategory";

@Entity()
export class GeneralProfile {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Profile, p => p.generalProfile)
    profile : Profile;

    @ManyToOne(() => Category)
    @JoinColumn()
    category : Category;

    @ManyToOne(() => SubCategory)
    @JoinColumn()
    subCategory : SubCategory;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    birthDate: string;

    @Column({default : ""})
    jobType: string;

    @Column()
    aboutMe: string;

    @Column()
    gender: string;

    @Column()
    photo: string;
}