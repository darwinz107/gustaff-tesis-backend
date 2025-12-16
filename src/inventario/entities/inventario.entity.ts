import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemsEntrada } from "./itemsEntrada.entity";
import { ItemsSalida } from "./itemsSalida.entity";
import { Bodega } from "src/parametro/entities/bodega";
import { Seccion } from "src/parametro/entities/seccion";
import { Percha } from "src/parametro/entities/percha";


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
     @ManyToOne(()=>Bodega,(bodega)=>bodega)
     bodega: Bodega;
     @ManyToOne(()=>Seccion,(seccion)=>seccion)
    seccion: Seccion;
    @ManyToOne(()=>Percha,(percha)=>percha)
    percha: Percha;
     @Column({type:'boolean',default:1})
     estado:boolean;
     @OneToMany(()=>ItemsEntrada,(itemsEntrada)=>itemsEntrada.item)
          itemEntrada:ItemsEntrada[];
          @OneToMany(()=>ItemsSalida,(itemsSalida)=>itemsSalida.inventario)
          itemsSalida:ItemsSalida[];
     
}
