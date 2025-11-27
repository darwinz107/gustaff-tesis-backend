import { SolicitudOrden } from "src/orden-de-trabajo/entities/solicitudOrden.entity";
import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cargo } from "./cargo.entity";

@Entity()
export class User {
@PrimaryGeneratedColumn()
id:number;
@Column()
name:string;
@Column({nullable:true})
identification:number;
@Column()
cellphone:number;
@Column()
email:string;
@Column()
password:string;
@Column({type:'date',nullable:true})
fechaNac:Date;
@ManyToOne(()=>Cargo,(cargo)=>cargo.relacionUser)
@JoinColumn({name:"cargoId"})
cargoId:Cargo;
@OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.userSolicitante)
solicitanteId:SolicitudOrden[];
@OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.userReceptor)
receptorId:SolicitudOrden[];
@OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.userTecnico)
tecnicoId:SolicitudOrden[];
}
