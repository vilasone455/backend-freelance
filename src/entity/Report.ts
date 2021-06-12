import {Entity, Column , PrimaryGeneratedColumn, ManyToOne, CreateDateColumn} from "typeorm";

import { User } from "./User";

@Entity()
export class Report  {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, u => u.reports)
    user: User;

    @Column()
    sectionName: string;

    @Column()
    tableName: number;

    @Column()
    objectId: number;

    @Column()
    description : string;

    @CreateDateColumn()
    createDate : Date;

}