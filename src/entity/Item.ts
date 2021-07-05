import {Entity, Column , PrimaryGeneratedColumn, ManyToOne, ManyToMany} from "typeorm";

@Entity()
export class PriceItem  {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    itemName : string;

    @Column()
    itemQty: string;
    
    @Column()
    itemPrice: number;

}