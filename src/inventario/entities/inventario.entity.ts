import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemsEntrada } from "./itemsEntrada.entity";
import { ItemsSalida } from "./itemsSalida.entity";


@Entity()
export class Inventario {
     @PrimaryGeneratedColumn()
     id:number;
     @Column()
     nombre:string;
     @Column()
     stock:number;
     @Column({type:"decimal",precision:10,scale:2})
     costo:number;
     @Column()
     bodega: string;
     @Column()
    seccion: string;
    @Column()
    percha: string;
     @Column({type:'boolean',default:1})
     estado:boolean;
     @OneToMany(()=>ItemsEntrada,(itemsEntrada)=>itemsEntrada.item)
          itemEntrada:ItemsEntrada[];
          @OneToMany(()=>ItemsSalida,(itemsSalida)=>itemsSalida.inventario)
          itemsSalida:ItemsSalida[];
     
}
