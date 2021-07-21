import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class Portfilio {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Profile, p => p.portfilios)
    profile: Profile;

    @Column()
    projectName: string;

    @Column()
    projectDescription: string;

    @Column()
    link: string;

    @Column({nullable : true})
    start: Date;

    @Column({nullable : true})
    end: Date;

    @Column({default:""})
    portfilioImages: string;

}