import { SolicitudDeCompra } from "src/solicitud-de-compra/entities/solicitud-de-compra.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EstadoTrabajo } from "./estadoTrabajo";
import { EstadoUso } from "./estadoUso";
import { Jornada } from "./jornadas";


@Entity('orden_trabajo')
export class SolicitudOrden {
    @PrimaryGeneratedColumn()
    id:number;
    @Column({type:'datetime',default:()=>'CURRENT_TIMESTAMP'})
    fechaRemision:Date;
    @Column()
    NumOrden:string;
    @Column({type:'date'})
    fechaInicio:Date;
    @Column({type:'date'})
    fechaFinal:Date;
    @Column({type:'time'})
    HoraInicio:string;
    @Column({type:'time'})
    HoraFinal:string;
    @Column()
    Area:string;
    @Column()
    Codigo:string;
    @Column()
    Maquina:string;
    @Column({nullable:true})
    EspecificacionMaquina:string;
    @Column()
    Categoria:string;
    @Column()
    TipoTrabajo:string;
    @Column({nullable:true})
    DescripcionTrabajo:string;
    @ManyToOne(()=>User,(user)=>user.solicitanteId)
    userSolicitante:User;
    @ManyToOne(()=>User,(user)=>user.receptorId)
    userReceptor:User;
    @ManyToOne(()=>User,(user)=>user.tecnicoId,{nullable:true})
    userTecnico:User|null; 
    @OneToOne(()=>SolicitudDeCompra,(solicitudDeCompra)=>solicitudDeCompra.numOrdenTrabajo)
    solicitudTrabajo:SolicitudDeCompra;
    @ManyToOne(()=>EstadoTrabajo,(estadoTrabajo)=>estadoTrabajo.ordenTrabajo)
    estadoTrabajo:EstadoTrabajo;
    @ManyToOne(()=>EstadoUso,(estadoUso)=>estadoUso.ordenTrabajo)
    estadoUso:EstadoUso; 
    @OneToMany(()=>Jornada,(jornada)=>jornada.OrdenDeTrabajoId)
    jornadasOrdenDeTrabajoId:Jornada[];
}