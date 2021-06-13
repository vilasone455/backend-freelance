import {Entity, Column , PrimaryGeneratedColumn, ManyToOne, CreateDateColumn} from "typeorm";

import { User } from "./User";

@Entity()
export class Report  {

    @PrimaryGeneratedColumn()
    id: number;

    
    @Column({default : "0"})
    section: string;

    @Column()
    tableName: string;

    @Column()
    objectId: number;

    @Column()
    description : string;

    @CreateDateColumn()
    createDate : Date;

    @ManyToOne(() => User, u => u.reports)
    sender: User;


}