import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from "typeorm";
import { Order } from "./Order";
import { User } from "./User";

@Entity()
export class ChatLog {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default : ""})
    msg: string;

    @ManyToOne(()=>User)
    sender: User;

    @ManyToOne(()=>User)
    recipient : User

    @ManyToOne(()=>Order)
    order : Order

    @CreateDateColumn()
    createDate : Date


}