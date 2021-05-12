import {Entity, PrimaryGeneratedColumn, Column, OneToOne,  OneToMany, ManyToOne, JoinColumn} from "typeorm";

import { ServicePackage } from "./ServicePackage";
import { ServiceReview } from "./ServiceReview";
import {ServiceFaq} from './ServiceFaq'
import { User } from "./User";
import { Category } from "./Category";
import { SubCategory } from "./SubCategory";
import { ServiceStep } from "./ServiceStep";

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

    @OneToOne(() => Category)
    @JoinColumn()
    category: Category;

    @OneToOne(() => SubCategory)
    @JoinColumn()
    subCategory: SubCategory;

    @Column({default : 0})
    startPrice : number;

    @ManyToOne(() => User , u => u.services)
    user: User;

    @OneToMany(() => ServicePackage , s=>s.service )
    servicePackages : ServicePackage[]

    @OneToMany(() => ServiceReview , s=>s.service )
    serviceReviews : ServiceReview[]

    @OneToMany(() => ServiceFaq , s=>s.service )
    serviceFaqs : ServiceFaq[]

    @OneToMany(() => ServiceStep , s=>s.service )
    serviceSteps : ServiceStep[]


}