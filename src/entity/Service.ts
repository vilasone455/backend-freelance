import {Entity, PrimaryGeneratedColumn, Column, OneToOne,  OneToMany, ManyToOne} from "typeorm";

import { ServicePackage } from "./ServicePackage";
import { ServiceReview } from "./ServiceReview";
import {ServiceFaq} from './ServiceFaq'
import { User } from "./User";

@Entity()
export class Service {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    serviceName: string;

    @Column()
    serviceDescription: string;

    @Column({default : ""})
    serviceImages: string;

    @Column()
    typeJob: string;

    @ManyToOne(() => User , u => u.services)
    user: User;

    @OneToMany(() => ServicePackage , s=>s.service )
    servicePackages : ServicePackage[]

    @OneToMany(() => ServiceReview , s=>s.service )
    serviceReviews : ServiceReview[]

    @OneToMany(() => ServiceFaq , s=>s.service )
    serviceFags : ServiceFaq[]

}