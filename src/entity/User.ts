import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userName: string;

    @Column()
    userEmail: string;

    @Column()
    userPassword: string;

    @OneToOne(() => Profile)
    @JoinColumn()
    profile: Profile;

}