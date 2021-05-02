import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm";
import { Profile } from "./Profile";
import {PortfilioImage} from './PortfilioImage'
@Entity()
export class Portfilio {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Profile, p => p.portfilios)
    profile: Profile;

    @Column()
    projectName: string;

    @Column()
    projectDescription: string;

    @Column()
    link: string;

    @Column()
    start: string;

    @Column()
    end: string;

    @OneToMany(() => PortfilioImage, p => p.portfilio)
    portfilioImages: PortfilioImage[];

}