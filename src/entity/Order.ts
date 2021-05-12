import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable} from "typeorm";
import { PriceItem } from "./Item";
import { User } from "./User";

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    orderTitle: string;

    @Column()
    orderDescription: string;
    
    @Column()
    orderStatus: number;

    @ManyToMany(() => PriceItem, p => p.orders)
    @JoinTable()
    priceItems : PriceItem[]
    
    @ManyToOne(() => User, u => u.orders)
    user: User;

    @ManyToOne(() => User, u => u.orders)
    freelance: User;


}