import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemsSalida } from "./itemsSalida.entity";
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
     stockMin:number;
     @Column()
     costo:number;
     @Column()
     estado:string;
     @OneToMany(()=>ItemsSalida,(itemsSalida)=>itemsSalida.infoItem)
     salida:ItemsSalida[];
     @OneToMany(()=>ItemsEntrada,(itemsEntrada)=>itemsEntrada.infoItem)
     entrada:ItemsEntrada[];
}
