import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SolicitudOrden } from "./solicitudOrden.entity";


@Entity('estado_de_trabajo')
export class EstadoTrabajo {
   @PrimaryGeneratedColumn() 
   id:number;
   @Column()
   estado:string;
   @OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.estadoTrabajo)
   ordenTrabajo:SolicitudOrden[]; 
}