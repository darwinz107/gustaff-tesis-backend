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
@ManyToOne(()=>Role,(role)=>role.user)
@JoinColumn({name:"rolId"})
rolId:Role;
@OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.userSolicitante)
solicitanteId:SolicitudOrden[];
@OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.userReceptor)
receptorId:SolicitudOrden[];
@OneToMany(()=>SolicitudOrden,(solicitudOrden)=>solicitudOrden.userReceptor)
tecnicoId:SolicitudOrden[];
}
