import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class GeneralProfile {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    birthDate: string;

    @Column()
    aboutMe: string;

    @Column()
    gender: string;

    @Column()
    photo: string;
}