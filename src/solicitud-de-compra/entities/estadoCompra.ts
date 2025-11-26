import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SolicitudDeCompra } from "./solicitud-de-compra.entity";

@Entity()
export class EstadoCompra {
@PrimaryGeneratedColumn()
id:number;
@Column()    
estado:string;
@OneToMany(()=>SolicitudDeCompra,(solicitudDeCompra)=>solicitudDeCompra)
solicitudCompra:SolicitudDeCompra[]
}