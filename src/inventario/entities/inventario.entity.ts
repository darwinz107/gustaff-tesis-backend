import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Inventario {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     nombre:string;
     @Column()
     stock:number;
     @Column()
     costo:number;
     @Column({type:'boolean'})
     estado:boolean;
     
}
