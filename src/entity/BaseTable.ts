import {PrimaryGeneratedColumn} from "typeorm";

export abstract class BaseTable {

    @PrimaryGeneratedColumn()
    id: number;

}