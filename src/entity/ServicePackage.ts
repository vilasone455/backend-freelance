import {Entity, PrimaryGeneratedColumn, Column,  ManyToOne} from "typeorm";

import { Service } from "./Service";

@Entity()
export class ServicePackage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    packageName: string;

    @Column()
    packageDescription: string;
    
    @Column()
    packagePrice: number;

    @Column({default : 1})
    workTime: number;

    @ManyToOne(() => Service, s=>s.servicePackages)
    service: Service;

}