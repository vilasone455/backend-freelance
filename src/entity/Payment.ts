import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn} from "typeorm";
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

    @Column({default : false})
    isPayment: boolean;
    
    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date;
    
    @ManyToOne(() => Order, o=>o.payments)
    order : Order    
}