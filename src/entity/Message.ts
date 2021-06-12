import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class Message {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, u=>u.senderMessages)
    sender : User

    @ManyToOne(() => User, u=>u.receiverMessages)
    receiver : User

    @Column()
    title : string;

    @Column()
    message : string;

    @Column()
    messageType : number
}