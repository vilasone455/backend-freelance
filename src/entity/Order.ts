
import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, OneToMany} from "typeorm";
import { Payment } from "./Payment";

import { Proposal } from "./Proposal";
import { Review } from "./Review";
import { WorkFile } from "./WorkFile";

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    orderStatus: number;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt: Date;

    @Column({default : () => "CURRENT_TIMESTAMP(6)"})
    finishAt: Date;

    @OneToOne(() => Proposal)
    @JoinColumn()
    proposal : Proposal

    @OneToOne(() => Review, r => r.order) // specify inverse side as a second parameter
    @JoinColumn()
    review : Review

    @OneToMany(() => Payment, p => p.order)
    payments : Payment[]

    @OneToMany(() => WorkFile, w => w.order )
    workFiles : WorkFile[]
}
