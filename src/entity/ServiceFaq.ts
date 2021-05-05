import {Entity, Column,  ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { BaseTable } from "./BaseTable";
import { Service } from "./Service";

@Entity()
export class ServiceFaq  {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    question: string;

    @Column()
    answer: number;

    @ManyToOne(() => Service, s=>s.serviceFags)
    service: Service;

}