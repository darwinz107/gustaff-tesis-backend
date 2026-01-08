import { SolicitudOrden } from "src/orden-de-trabajo/entities/solicitudOrden.entity";
import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cargo } from "./cargo.entity";
import { RegistroSalida } from "src/inventario/entities/registroSalida.entity";
import { RegistroEntrada } from "src/inventario/entities/registroEntrada.entity";

@Entity()
export class User {
@PrimaryGeneratedColumn()
id:number;
@Column()
name:string;
@Column({nullable:true})
identification:string;
@Column()
cellphone:string;
@Column()
email:string;
@Column()
password:string;
@Column({default:true})
estado:boolean;
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
@OneToMany(()=>RegistroSalida,(registroSalida)=>registroSalida.entrega)
registroSalida:RegistroSalida[];
@OneToMany(()=>RegistroSalida,(registroSalida2)=>registroSalida2.recibeSinSM)
registroSalida2:RegistroSalida[];
@OneToMany(()=>RegistroEntrada,(registroEntrada)=>registroEntrada.recibe)
registroEntrada:RegistroEntrada[]
}
