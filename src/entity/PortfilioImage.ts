import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { Portfilio } from "./Portfilio";

@Entity()
export class PortfilioImage {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Portfilio, p => p.portfilioImages)
    portfilio: Portfilio;

    @Column()
    link : string;
}