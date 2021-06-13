import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn} from "typeorm";
import { PriceItem } from "./Item";
import { JobPost } from "./JobPost";
import { Message } from "./Message";
import { Order } from "./Order";
import { Profile } from "./Profile";
import { Proposal } from "./Proposal";
import { Report } from "./Report";
import { Review } from "./Review";
import { Service } from "./Service";
import { ServiceReview } from "./ServiceReview";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userName: string;

    @Column()
    userEmail: string;

    @Column()
    userPassword: string;

    @Column({default : 1})
    userType: number;

    @OneToOne(() => Profile)
    @JoinColumn()
    profile: Profile;

    @CreateDateColumn()
    createdDate: Date;

    @OneToMany(() => JobPost, j => j.user)
    jobPosts: JobPost[];

    @OneToMany(() => Service, s => s.user)
    services : Service[]

    @OneToMany(() => ServiceReview, s => s.user)
    serviceComments : ServiceReview[]

    @OneToMany(()=>PriceItem , p=>p.user)
    priceItems : PriceItem[]

    @OneToMany(()=>Proposal , p=>p.user)
    proposals : Proposal[]

    @OneToMany(()=>Message , p=>p.sender)
    senderMessages : Message[]

    @OneToMany(()=>Message , p=>p.receiver)
    receiverMessages : Message[]

    
    @OneToMany(() => Report, r => r.sender)
    reports : Report[]


}