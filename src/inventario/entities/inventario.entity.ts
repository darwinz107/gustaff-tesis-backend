import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemsEntrada } from "./itemsEntrada.entity";


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
     @Column()
     bodega: string;
     @Column()
    seccion: string;
    @Column()
    percha: string;
     @Column({type:'boolean'})
     estado:boolean;
     @OneToMany(()=>ItemsEntrada,(itemsEntrada)=>itemsEntrada.item)
          itemEntrada:ItemsEntrada[];
     
}
