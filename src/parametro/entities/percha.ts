import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Codigo } from "./codigo.entity";
import { Seccion } from "./seccion";

@Entity()
export class Percha{
   @PrimaryGeneratedColumn()
   id:number;
   @Column()
   percha:string;
   @ManyToOne(()=>Seccion,(seccion)=>seccion.percha)
   @JoinColumn()
   seccion:Seccion;
}