import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Codigo } from "./codigo.entity";
import { SolicitudOrden } from "./solicitudOrden.entity";

@Entity()
export class Maquina{
   @PrimaryGeneratedColumn()
   id:number;
   @Column()
   nombre:string;
   @ManyToOne(()=>Codigo,(codigo)=>codigo.maquina)
   @JoinColumn()
   codigo:Codigo;
   @OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.maquina)
       infoMaquina:SolicitudOrden[] 
}