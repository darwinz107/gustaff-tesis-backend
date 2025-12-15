import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Area } from "./area.entity";
import { Maquina } from "./maquina.entity";
import { Bodega } from "./bodega";
import { Percha } from "./percha";

@Entity()
export class Seccion{
   @PrimaryGeneratedColumn()
   id:number;
   @Column()
   seccion:string;
   @ManyToOne(()=>Bodega,(bodega)=>bodega.seccion)
   @JoinColumn()
   bodega:Bodega;

   @OneToMany(()=>Percha,(percha)=>percha.percha)
   percha:Percha[]
}