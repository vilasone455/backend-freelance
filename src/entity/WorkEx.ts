import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class WorkEx {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Profile, p => p.workExs)
    profile: Profile;

    @Column()
    companyName: string;

    @Column()
    position: string;

    @Column()
    aboutWork: string;

    @Column({nullable : true})
    start: Date;

    @Column({nullable : true})
    end: Date;
}