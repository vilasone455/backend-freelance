import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Address {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    village: string;

    @Column()
    city: string;

    @Column()
    capital: string;

    @Column()
    tel: string;

    @Column()
    gmail: string;

    @Column()
    facebookLink: string;

    @Column()
    linkedinLink : string;
}