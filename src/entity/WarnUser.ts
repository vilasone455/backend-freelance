import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class WarnUser {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createDate : Date

    @Column()
    warnReason : string

    @ManyToOne(() => User, u=>u.bans)
    user : User

    @ManyToOne(() => User, u=>u.adminBan)
    admin : User
  
}