import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Codigo } from "./codigo.entity";
import { Seccion } from "./seccion";
import { Inventario } from "src/inventario/entities/inventario.entity";

@Entity()
export class Percha{
   @PrimaryGeneratedColumn()
   id:number;
   @Column()
   percha:string;
   @ManyToOne(()=>Seccion,(seccion)=>seccion.percha)
   @JoinColumn()
   seccion:Seccion;
   @OneToMany(()=>Inventario,(inventario)=>inventario.percha)
       inventario:Inventario[]
}