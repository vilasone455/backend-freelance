import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn} from "typeorm";
import { Order } from "./Order";

@Entity()
export class WorkFile {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fileName: string;

    @Column({default : 0})
    fileSize: number;

    @Column({default : ""})
    fileFormat: string;

    @Column()
    fileUrl: string;

    @Column({default : ""})
    refId: string;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date;

    @ManyToOne(() => Order, o=>o.workFiles)
    order : Order    
}