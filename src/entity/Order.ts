import ProposalController from "src/controller/ProposalController";
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn} from "typeorm";
import { PriceItem } from "./Item";
import { Proposal } from "./Proposal";
import { User } from "./User";

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    orderStatus: number;

    @OneToOne(() => Proposal)
    @JoinColumn()
    proposal : Proposal

}
