import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { Order } from "./Order";

@Entity()
export class WorkFile {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fileName: string;

    @Column()
    fileUrl: string;

    @ManyToOne(() => Order, o=>o.workFiles)
    order : Order    
}