import {Entity, Column , PrimaryGeneratedColumn, ManyToOne} from "typeorm";

import { User } from "./User";

@Entity()
export class Report  {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, u => u.reports)
    user: User;

    @Column()
    description : string;

    @Column()
    sectionName: string;

    objectId: number;

}