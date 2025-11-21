import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Categoria{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    nombre:string;
    
}