import {Entity, Column , PrimaryGeneratedColumn, ManyToOne, ManyToMany} from "typeorm";
import { Order } from "./Order";

import { User } from "./User";

@Entity()
export class PriceItem  {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, p => p.priceItems)
    user: User;

    @ManyToMany(() => Order, o => o.priceItems)
    orders: Order[];

    @Column()
    itemName : string;

    @Column()
    itemQty: string;
    
    @Column()
    itemPrice: number;

}