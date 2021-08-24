import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from "typeorm";

@Entity()
export class DailyLog {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default : ""})
    msg : string

    @CreateDateColumn()
    createDate : Date
  
}