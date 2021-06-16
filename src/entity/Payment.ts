import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { Order } from "./Order";

@Entity()
export class Payment {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paymentName: string;

    @Column()
    paymentImage: string;

    @Column()
    amount: number;

    @ManyToOne(() => Order, o=>o.payments)
    order : Order    
}