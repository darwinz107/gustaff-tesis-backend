import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Area } from "./area.entity";
import { Maquina } from "./maquina.entity";
import { Bodega } from "./bodega";
import { Percha } from "./percha";
import { Inventario } from "src/inventario/entities/inventario.entity";

@Entity()
export class Seccion{
   @PrimaryGeneratedColumn()
   id:number;
   @Column()
   seccion:string;
   @ManyToOne(()=>Bodega,(bodega)=>bodega.seccion)
   
   bodega:Bodega;

   @OneToMany(()=>Percha,(percha)=>percha.percha)
   percha:Percha[]
   @OneToMany(()=>Inventario,(inventario)=>inventario.seccion)
       inventario:Inventario[]
}