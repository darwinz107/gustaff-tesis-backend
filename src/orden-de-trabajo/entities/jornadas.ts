import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SolicitudOrden } from "./solicitudOrden.entity";
import { Fases } from "./fases";

@Entity()
export class Jornada{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({type:'date'})
    fecha:Date;
    @ManyToOne(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.jornadasOrdenDeTrabajoId)
    OrdenDeTrabajoId:SolicitudOrden;
    @OneToMany(()=>Fases,(fases)=>fases.jornada)
    fases:Fases[];
}