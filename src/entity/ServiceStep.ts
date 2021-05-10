import {Entity, Column,  ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { Service } from "./Service";

@Entity()
export class ServiceStep  {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    stepName: string;

    @Column()
    stepDescription: string;

    @ManyToOne(() => Service, s=>s.serviceSteps)
    service: Service;

}