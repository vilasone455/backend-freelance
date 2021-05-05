import {Entity,  Column,  ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { BaseTable } from "./BaseTable";
import { Service } from "./Service";
import { User } from "./User";

@Entity()
export class ServiceReview  {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=>User)
    user : User;

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

    @ManyToOne(() => Service, s=>s.serviceReviews)
    service: Service;

}