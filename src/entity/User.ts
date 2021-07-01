import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn} from "typeorm";
import { BanUser } from "./BanUser";
import { PriceItem } from "./Item";
import { JobPost } from "./JobPost";
import { Message } from "./Message";

import { Profile } from "./Profile";
import { Proposal } from "./Proposal";
import { Report } from "./Report";
import { Review } from "./Review";
import { Service } from "./Service";
import { ServiceReview } from "./ServiceReview";
import { UnBanUser } from "./UnBanUser";
import { WarnUser } from "./WarnUser";
import { WorkFile } from "./WorkFile";

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

    @Column({default : ""})
    image: string;

    @Column({default : false})
    isBan : boolean

    @OneToOne(() => Profile, profile => profile.user) 
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

    @OneToMany(()=>WorkFile , f=>f.owner)
    files : WorkFile[]

    @OneToMany(() => Report, r => r.sender)
    reports : Report[]

    @OneToMany(()=> BanUser , b => b.user)
    bans : BanUser[]

    @OneToMany(()=> BanUser , b => b.admin)
    adminBan : BanUser[]

    @OneToMany(()=> WarnUser , w => w.user)
    warns : WarnUser[]

    @OneToMany(()=> WarnUser , w => w.admin)
    adminWarn : WarnUser[]

    @OneToMany(()=> UnBanUser , u => u.user)
    unBans : UnBanUser[]

    @OneToMany(()=> UnBanUser , u => u.admin)
    adminUnBan : WarnUser[]

}