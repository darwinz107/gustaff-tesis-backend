import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SolicitudOrden } from "./solicitudOrden.entity";


@Entity('estado_uso')
export class EstadoUso {
   @PrimaryGeneratedColumn() 
   id:number;
   @Column()
   uso:boolean;
   @OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.estadoUso)
   ordenTrabajo:SolicitudOrden[]; 
}