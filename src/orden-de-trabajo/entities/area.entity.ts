import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Codigo } from "./codigo.entity";
import { SolicitudOrden } from "./solicitudOrden.entity";

@Entity()
export class Area {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    nombre:string;
    @OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.area)
    infoArea:SolicitudOrden[] 
    @OneToMany(()=>Codigo,(codigo)=>codigo.area)
    codigo:Codigo[]
}
