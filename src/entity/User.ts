import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany} from "typeorm";
import { PriceItem } from "./Item";
import { JobPost } from "./JobPost";
import { Order } from "./Order";
import { Profile } from "./Profile";
import { Proposal } from "./Proposal";
import { Report } from "./Report";
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

    @OneToMany(() => JobPost, j => j.user)
    jobPosts: JobPost[];

    @OneToMany(() => Service, s => s.user)
    services : Service[]

    @OneToMany(() => Order, o => o.user)
    orders : Order[]

    @OneToMany(() => ServiceReview, s => s.user)
    serviceComments : ServiceReview[]

    @OneToMany(() => Report, r => r.user)
    reports : Report[]

    @OneToMany(()=>PriceItem , p=>p.user)
    priceItems : PriceItem[]

    @OneToMany(()=>Proposal , p=>p.user)
    proposals : Proposal[]

}