import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne} from "typeorm";
import { Profile } from "./Profile";


@Entity()
export class Language {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    languageName: string;

    @Column()
    level: number;

    @ManyToOne(() => Profile, p => p.languages)
    profile : Profile


}