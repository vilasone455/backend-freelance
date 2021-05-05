import {Entity, Column,  ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { Service } from "./Service";

@Entity()
export class ServiceFaq  {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    question: string;

    @Column()
    answer: string;

    @ManyToOne(() => Service, s=>s.serviceFaqs)
    service: Service;

}