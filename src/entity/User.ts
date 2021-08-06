import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn} from "typeorm";
import { BanUser } from "./BanUser";

import { JobPost } from "./JobPost";
import { Message } from "./Message";

import { Profile } from "./Profile";
import { Proposal } from "./Proposal";
import { Report } from "./Report";
import { Review } from "./Review";

import { UnBanUser } from "./UnBanUser";
import { WarnUser } from "./WarnUser";
import { WorkFile } from "./WorkFile";
import {NoficationTb} from './NoficationTb'

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

    @OneToMany(() => Review, r => r.freelance)
    reviews: Review[];

    @OneToMany(()=>Proposal , p=>p.user)
    proposals : Proposal[]

    @OneToMany(()=>Message , p=>p.sender)
    senderMessages : Message[]

    @OneToMany(()=>Message , p=>p.receiver)
    receiverMessages : Message[]

    @OneToMany(()=>NoficationTb , n=>n.sender)
    sendNofications : NoficationTb[]

    @OneToMany(()=>NoficationTb , n=>n.receiver)
    myNofications : NoficationTb[]

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

export interface UserWithHireCount extends User{
    count : number
}

export interface UserWithReview extends User{
    reviewCount : number
    averageReview : number
}