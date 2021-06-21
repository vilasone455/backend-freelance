import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class UnBanUser {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createDate : Date

    @Column()
    unBanReason : string

    @ManyToOne(() => User, u=>u.bans)
    user : User

    @ManyToOne(() => User, u=>u.adminBan)
    admin : User
  
}