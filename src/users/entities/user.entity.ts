import { Cargo } from "src/cargo/entities/cargo.entity";
import { SolicitudOrden } from "src/orden-de-trabajo/entities/solicitudOrden.entity";
import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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
@ManyToOne(()=>Cargo,(cargo)=>cargo.user)
infoCargo:Cargo;
@OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.userSolicitante)
solicitanteId:SolicitudOrden[];
@OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.userReceptor)
receptorId:SolicitudOrden[];
@OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.userReceptor)
tecnicoId:SolicitudOrden[];
}
