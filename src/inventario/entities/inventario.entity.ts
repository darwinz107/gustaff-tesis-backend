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
     @Column({type:'int',unsigned:true,default:0})
     stock:number;
     @Column({type:'int',unsigned:true,default:0})
     stockMin:number;
     @Column({type:"decimal",precision:10,scale:2,unsigned:true, default:0})
     costo:number;
     @Column({type: 'text', nullable: true})
     imagen: string | null;
     @ManyToOne(()=>Bodega,(bodega)=>bodega,{nullable:true})
     bodega: Bodega;
     @ManyToOne(()=>Seccion,(seccion)=>seccion,{nullable:true})
    seccion: Seccion;
    @ManyToOne(()=>Percha,(percha)=>percha,{nullable:true})
    percha: Percha;
     @Column({type:'boolean',default:1})
     estado:boolean;
     @OneToMany(()=>ItemsEntrada,(itemsEntrada)=>itemsEntrada.item)
          itemEntrada:ItemsEntrada[];
          @OneToMany(()=>ItemsSalida,(itemsSalida)=>itemsSalida.inventario)
          itemsSalida:ItemsSalida[];
     
}
