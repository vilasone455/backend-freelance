
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Order } from "./Order";

import { User } from "./User";

@Entity()
export class Review {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    comment: string;

    @Column()
    productScore: number;
    
    @Column()
    serviceScore: number;

    @Column()
    priceScore: number;

    @Column()
    chatScore: number;

    @OneToOne(() => Order, o => o.review) // specify inverse side as a second parameter
    order : Order
}
