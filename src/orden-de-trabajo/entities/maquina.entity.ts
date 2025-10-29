import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Codigo } from "./codigo.entity";

@Entity()
export class Maquina{
   @PrimaryGeneratedColumn()
   id:number;
   @Column()
   nombre:string;
   @ManyToOne(()=>Codigo,(codigo)=>codigo.maquina)
   codigo:Codigo;
}