import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany} from "typeorm";
import { JobPost } from "./JobPost";
import { Profile } from "./Profile";
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

    @Column({default : ""})
    userType: string;

    @OneToOne(() => Profile)
    @JoinColumn()
    profile: Profile;

    @OneToMany(() => JobPost, j => j.user)
    jobPosts: JobPost[];

    @OneToMany(() => Service, s => s.user)
    services : Service[]

    @OneToMany(() => ServiceReview, s => s.user)
    serviceComments : ServiceReview[]

}