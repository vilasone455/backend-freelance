import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class NoficationTb{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, u=>u.sendNofications)
    sender : User

    @ManyToOne(() => User, u=>u.myNofications)
    receiver : User

    @Column({default : ""})
    subject : string

    @Column()
    typeNofication : number

    @Column({default : 0})
    objectId : number

    @Column({default : false})
    isRead : boolean

    @Column({default : ""})
    url : string

    @CreateDateColumn()
    createDate : Date



}