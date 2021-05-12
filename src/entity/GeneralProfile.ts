import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from "typeorm";
import { Category } from "./Category";
import { Profile } from "./Profile";
import { SubCategory } from "./SubCategory";

@Entity()
export class GeneralProfile {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Profile, p => p.generalProfile)
    profile : Profile;

    @OneToOne(() => Category)
    @JoinColumn()
    category : Category;

    @OneToOne(() => SubCategory)
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