
import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn} from "typeorm";

import { Proposal } from "./Proposal";
import { Review } from "./Review";

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

}
